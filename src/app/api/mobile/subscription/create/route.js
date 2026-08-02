import { getUser } from "@/helper/auth/auth";
import { connectDB } from "@/lib/dbconnection/db";
import razorpay from "@/lib/razorpay/razorpay";
import SubscriptionModel from "@/model/payment/subscription.model";
import UserModel from "@/model/user/user.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Extract the selected plan type from the request body
    const body = await request.json();
    const { planType } = body; // Expected: "monthly" or "yearly"

    if (!["monthly", "yearly"].includes(planType)) {
      return NextResponse.json(
        { message: "Invalid plan type. Must be 'monthly' or 'yearly'." },
        { status: 400 },
      );
    }

    await connectDB();
    const authUser = await getUser(request);

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findById(authUser.id).lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "client") {
      return NextResponse.json(
        { message: "Only clients can purchase subscriptions." },
        { status: 403 },
      );
    }
    if (!user.assignedCaId) {
      return NextResponse.json({ message: "No CA assigned." }, { status: 400 });
    }

    // 2. Check for active/valid subscription
    const activeSubscription = await SubscriptionModel.findOne({
      userId: user._id,
      status: { $in: ["authenticated", "active", "grace_period"] },
    }).lean();

    if (activeSubscription) {
      return NextResponse.json(
        { message: "You already have an active subscription." },
        { status: 409 },
      );
    }

    // 3. Configure the Plan Map based on environment variables
    const PLAN_CONFIG = {
      monthly: {
        id: process.env.RAZORPAY_PLAN_ID_MONTHLY,
        total_count: 12, // Number of billing cycles (e.g., 12 months)
      },
      yearly: {
        id: process.env.RAZORPAY_PLAN_ID_YEARLY,
        total_count: 1, // Number of billing cycles (e.g., 1 year)
      },
    };

    const selectedConfig = PLAN_CONFIG[planType];

    if (!selectedConfig.id) {
      return NextResponse.json(
        { message: `${planType} plan ID is not configured on the server.` },
        { status: 500 },
      );
    }

    // 4. Fetch Plan Details & Create Razorpay Subscription
    const plan = await razorpay.plans.fetch(selectedConfig.id);

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: selectedConfig.id,
      total_count: selectedConfig.total_count,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: user._id.toString(),
        assignedCaId: user.assignedCaId.toString(),
        planType: planType, // Good practice to store this in notes for webhook reference
      },
    });

    // 5. Save to DB safely (Preserve History)
    let subscription = await SubscriptionModel.findOneAndUpdate(
      {
        userId: user._id,
        status: "created", // ONLY overwrite if it's an uncompleted checkout
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
      { status: 500 },
    );
  }
}
