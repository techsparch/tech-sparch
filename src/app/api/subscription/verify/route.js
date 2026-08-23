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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_order_id, 
      original_subscription_id, // Sent directly from the frontend
      razorpay_signature 
    } = body;

    // Reject if missing core requirements
    if (!razorpay_payment_id || !razorpay_signature || !original_subscription_id) {
      return NextResponse.json(
        { success: false, message: "Missing required payment parameters." },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. VERIFY SIGNATURE (MATH ONLY)
    // ==========================================
    let textToVerify;
    if (razorpay_order_id) {
      // Razorpay sent an order_id (Live Mode authentication mandate)
      textToVerify = `${razorpay_order_id}|${razorpay_payment_id}`;
    } else if (razorpay_subscription_id) {
      // Razorpay sent a subscription_id (Standard/Test Mode)
      textToVerify = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    } else {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay reference IDs." },
        { status: 400 }
      );
    }
    
    // Hash and compare
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(textToVerify)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature." },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. UPDATE EXACT DATABASE RECORD
    // ==========================================
    // Look up the exact record using the original ID generated during creation
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId: original_subscription_id, 
      userId: session.user.id,
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Payment record not found in database." },
        { status: 404 }
      );
    }

    // Update the database record if it's pending
    if (subscription.status === "created") {
      subscription.status = "authenticated";
      
      // Store the final Razorpay IDs for your records (useful for debugging)
      subscription.razorpayPaymentId = razorpay_payment_id;
      if (razorpay_order_id) subscription.razorpayOrderId = razorpay_order_id;
      
      await subscription.save();
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
    });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}