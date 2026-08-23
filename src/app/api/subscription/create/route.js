import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "../../auth/[...nextauth]/option";

import UserModel from "@/model/user/user.model";
import SubscriptionModel from "@/model/payment/subscription.model";
import razorpay from "@/lib/razorpay/razorpay";

export async function POST(request) {
  try {
    // 1. Extract the selected plan type from the request body
    const body = await request.json();
    const { planType } = body;

    if (!["weekly", "monthly", "yearly"].includes(planType)) {
      return NextResponse.json(
        {
          message:
            "Invalid plan type. Must be 'weekly', 'monthly', or 'yearly'.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Authenticate
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user.id;

    // Find User (using .lean() for faster read performance)
    const user = await UserModel.findById(currentUser).lean();



    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Only clients can subscribe
    if (user.role !== "client") {
      return NextResponse.json(
        { message: "Only clients can purchase subscriptions." },
        { status: 403 },
      );
    }

    
    if (!user.assignedCaId) {
      return NextResponse.json({ message: "No CA assigned." }, { status: 400 });
    }

    // Check for existing active subscriptions
    // Note: We removed "created" from this list so abandoned checkouts don't block new attempts
    const activeSubscription = await SubscriptionModel.findOne({
      userId: user._id,
      status: {
        $in: ["authenticated", "active", "grace_period"],
      },
    }).lean();

    if (activeSubscription) {
      return NextResponse.json(
        {
          message: "You already have an active subscription.",
        },
        { status: 409 },
      );
    }

    // Configure Plan Map based on environment variables
    const PLAN_CONFIG = {
      monthly: {
        id: process.env.RAZORPAY_PLAN_ID_MONTHLY,
        total_count: 60, // 5 years
      },
      yearly: {
        id: process.env.RAZORPAY_PLAN_ID_YEARLY,
        total_count: 5, // 5 years
      },
    };

    const selectedConfig = PLAN_CONFIG[planType];
    console.log(selectedConfig ,"selectedConfig" )


    if (!selectedConfig.id) {
      return NextResponse.json(
        { message: `${planType} plan ID is not configured on the server.` },
        { status: 500 },
      );
    }


    // Fetch Razorpay Plan
    const plan = await razorpay.plans.fetch(selectedConfig.id);

    console.log(plan , "plan id")

    // Create Razorpay Subscription
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: selectedConfig.id,
      total_count: selectedConfig.total_count,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: user._id.toString(),
        assignedCaId: user.assignedCaId.toString(),
        planType: planType,
      },
    });

    // Save in MongoDB safely (Preserve History)
    let subscription = await SubscriptionModel.findOneAndUpdate(
      {
        userId: user._id,
        status: "created", // Overwrites ONLY if it is an abandoned checkout
      },
      {
        userId: user._id,
        assignedCaId: user.assignedCaId,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: razorpaySubscription.plan_id,
        amount: plan.item.amount / 100,
        currency: plan.item.currency,
        planName: plan.item.name,
        status: "created",
        serviceEnabled: false,
      },
      {
        new: true,
      },
    );

    // If no abandoned checkout existed to overwrite, create a new record
    if (!subscription) {
      subscription = await SubscriptionModel.create({
        userId: user._id,
        assignedCaId: user.assignedCaId,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: razorpaySubscription.plan_id,
        amount: plan.item.amount / 100,
        currency: plan.item.currency,
        planName: plan.item.name,
        status: "created",
        serviceEnabled: false,
      });
    }

    return NextResponse.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: razorpaySubscription.id,
      plan: {
        type: planType,
        name: plan.item.name,
        amount: plan.item.amount / 100,
        currency: plan.item.currency,
      },
      subscription,
    });
  } catch (error) {
    console.error("Subscription Creation Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.error?.description || error.message || "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
