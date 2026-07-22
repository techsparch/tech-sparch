import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "../../auth/[...nextauth]/option";

import UserModel from "@/model/user/user.model";
import SubscriptionModel from "@/model/payment/subscription.model";
import razorpay from "@/lib/razorpay/razorpay";

export async function POST() {
  try {
    // Visual separator for the terminal
    console.log("\n==========================================");
    console.log("🚀 [CREATE_SUB] Initiating Subscription Creation...");

    await connectDB();
    console.log("🗄️ [CREATE_SUB] Database connected.");

    // Authenticate
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.warn("⚠️ [CREATE_SUB] Unauthorized: No active session found.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user.id;
    console.log(`👤 [CREATE_SUB] Authenticated User ID: ${currentUser}`);

    // Find User
    const user = await UserModel.findById(currentUser);

    if (!user) {
      console.error("❌ [CREATE_SUB] User not found in database.");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Only clients can subscribe
    if (user.role !== "client") {
      console.warn(
        `⚠️ [CREATE_SUB] Forbidden: User role is '${user.role}', expected 'client'.`,
      );
      return NextResponse.json(
        { message: "Only clients can purchase subscriptions." },
        { status: 403 },
      );
    }

    // CA must exist
    if (!user.assignedCaId) {
      console.warn("⚠️ [CREATE_SUB] Bad Request: No CA assigned to this user.");
      return NextResponse.json({ message: "No CA assigned." }, { status: 400 });
    }

    console.log(
      `👨‍💼 [CREATE_SUB] Assigned CA ID validated: ${user.assignedCaId}`,
    );

    // Existing subscription
    const existingSubscription = await SubscriptionModel.findOne({
      userId: user._id,
      status: {
        $in: ["created", "authenticated", "active", "grace_period"],
      },
    });

    if (existingSubscription) {
      console.warn(
        `⚠️ [CREATE_SUB] Conflict: Active subscription already exists (Status: ${existingSubscription.status}).`,
      );
      return NextResponse.json(
        {
          message: "Subscription already exists.",
        },
        { status: 409 },
      );
    }

    console.log("✅ [CREATE_SUB] No conflicting active subscriptions found.");

    // Fetch Razorpay Plan
    console.log(
      `⏳ [CREATE_SUB] Fetching Razorpay Plan ID: ${process.env.RAZORPAY_PLAN_ID}...`,
    );
    const plan = await razorpay.plans.fetch(process.env.RAZORPAY_PLAN_ID);
    console.log(
      `✅ [CREATE_SUB] Plan fetched successfully: ${plan.item.name} (${plan.item.amount / 100} ${plan.item.currency})`,
    );

    // Create Razorpay Subscription
    console.log("⏳ [CREATE_SUB] Creating Razorpay Subscription...");
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

    console.log(
      `✅ [CREATE_SUB] Razorpay Subscription created! Sub ID: ${razorpaySubscription.id}`,
    );

    // Save in MongoDB
    console.log("⏳ [CREATE_SUB] Saving subscription to local database...");
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

    console.log(
      `✅ [CREATE_SUB] Database entry created! Local Sub ID: ${subscription._id}`,
    );
    console.log(
      "🎉 [CREATE_SUB] Subscription creation process completed successfully.",
    );
    console.log("==========================================\n");

    return NextResponse.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      subscriptionId: razorpaySubscription.id,
      subscription,
    });
  } catch (error) {
    console.error("❌ [CREATE_SUB] Critical Error encountered:");
    console.error(error);
    console.log("==========================================\n");

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
