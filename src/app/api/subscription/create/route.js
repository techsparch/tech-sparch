import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "../../auth/[...nextauth]/option";

import UserModel from "@/model/user/user.model";
import SubscriptionModel from "@/model/payment/subscription.model";
import razorpay from "@/lib/razorpay/razorpay";

export async function POST() {
  try {
    await connectDB();

    // Authenticate
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user.id;

    // Find User
    const user = await UserModel.findById(currentUser);

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

    // CA must exist
    if (!user.assignedCaId) {
      return NextResponse.json({ message: "No CA assigned." }, { status: 400 });
    }

    // Existing subscription
    const existingSubscription = await SubscriptionModel.findOne({
      userId: user._id,
      status: {
        $in: ["created", "authenticated", "active", "grace_period"],
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          message: "Subscription already exists.",
        },
        { status: 409 },
      );
    }

    // Fetch Razorpay Plan
    const plan = await razorpay.plans.fetch(process.env.RAZORPAY_PLAN_ID);

    // Create Razorpay Subscription
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,

      notes: {
        userId: user._id.toString(),
        assignedCaId: user.assignedCaId.toString(),
      },
    });

    // Save in MongoDB
    const subscription = await SubscriptionModel.create({
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

    return NextResponse.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: razorpaySubscription.id,
      subscription,
    });
  } catch (error) {
    console.error("Subscription Creation Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.error?.description || error.message,
      },
      {
        status: 500,
      },
    );
  }
}
