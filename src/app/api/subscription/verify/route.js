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
      razorpay_order_id, 
      original_subscription_id, 
      razorpay_signature 
    } = body;

    if (!razorpay_payment_id || !razorpay_signature || !original_subscription_id) {
      return NextResponse.json(
        { success: false, message: "Missing required payment parameters." },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. VERIFY SIGNATURE (THE "TRY BOTH" METHOD)
    // ==========================================
    // Razorpay Live mode has a quirk where subscription mandates generate an order ID.
    // We will hash both the Order formula AND the Subscription formula. 
    // If EITHER matches, the payment is fully verified.

    const generateHash = (text) => 
      crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(text).digest("hex");

    // Formula A: The Order Format
    const orderHash = razorpay_order_id 
      ? generateHash(`${razorpay_order_id}|${razorpay_payment_id}`) 
      : null;

    // Formula B: The Subscription Format (Using the original ID we saved)
    const subHash = generateHash(`${razorpay_payment_id}|${original_subscription_id}`);

    // Check if the signature matches either formula
    const isValidSignature = (razorpay_signature === orderHash) || (razorpay_signature === subHash);

    console.log(isValidSignature)
    if (!isValidSignature) {
      console.error("Signature Mismatch. Expected:", { orderHash, subHash }, "Received:", razorpay_signature);
      return NextResponse.json(
        { success: false, message: "Invalid payment signature. Verification failed." },
        { status: 400 } // This is the 400 error you just saw!
      );
    }

    // ==========================================
    // 4. UPDATE EXACT DATABASE RECORD
    // ==========================================
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