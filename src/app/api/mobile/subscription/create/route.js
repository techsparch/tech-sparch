import { getUser } from "@/helper/auth/auth";
import { connectDB } from "@/lib/dbconnection/db";
import razorpay from "@/lib/razorpay/razorpay";
import SubscriptionModel from "@/model/payment/subscription.model";
import UserModel from "@/model/user/user.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const authUser = await getUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Find User
    const user = await UserModel.findById(authUser.id);

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
    // Note: We exclude 'created' here so abandoned checkouts can be overwritten
    const activeSubscription = await SubscriptionModel.findOne({
      userId: user._id,
      status: { $in: ["authenticated", "active", "grace_period"] },
    });

    if (activeSubscription) {
      return NextResponse.json(
        { message: "You already have an active subscription." },
        { status: 409 },
      );
    }

    // 3. Fetch Plan Details & Create Razorpay Subscription
    const plan = await razorpay.plans.fetch(process.env.RAZORPAY_PLAN_ID);

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

    // 4. Save to DB using findOneAndUpdate with upsert
    // Overwrites existing document (e.g. cancelled/created) or creates a new one
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId: user._id },
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
        upsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: razorpaySubscription.id,
      plan: {
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
        message: error.error?.description || error.message,
      },
      {
        status: 500,
      },
    );
  }
}
