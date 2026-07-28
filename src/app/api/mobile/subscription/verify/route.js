import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken"; // Standard JWT library to decode your accessToken
import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";
import { getUser } from "@/helper/auth/auth";

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log(authUser);

    // 2. Parse request body sent from Razorpay checkout handler
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required payment parameters." },
        { status: 400 },
      );
    }

    // 3. Find the subscription in MongoDB using the ID from the token
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId: razorpay_subscription_id,
      userId: authUser.id,
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription record not found." },
        { status: 404 },
      );
    }

    // 4. Verify HMAC SHA256 Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature. Verification failed.",
        },
        { status: 400 },
      );
    }

    // 5. Update local status
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
      { success: false, message: error.message || "Internal server error." },
      { status: 500 },
    );
  }
}
