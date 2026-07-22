import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "../../auth/[...nextauth]/option";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function POST(req) {
  try {
    await connectDB();

    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body sent from Razorpay checkout handler
    const body = await req.json();
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required payment parameters." },
        { status: 400 }
      );
    }

    // 3. Find the subscription in MongoDB
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId: razorpay_subscription_id,
      userId: session.user.id,
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription record not found." },
        { status: 404 }
      );
    }

    // 4. Verify HMAC SHA256 Signature
    // Razorpay signature format for subscriptions: payment_id | subscription_id
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // 5. Update local status to 'authenticated' 
    // (Note: Services remain disabled until the webhook confirms actual charging/activation)
    if (subscription.status === "created") {
      subscription.status = "authenticated";
      await subscription.save();
    }

    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully.",
    });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during verification.",
      },
      { status: 500 }
    );
  }
}