import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "../../auth/[...nextauth]/option";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function POST(req) {
  console.log("\n========== [SERVER] /api/subscription/verify INIT ==========");
  try {
    await connectDB();
    console.log("[SERVER] Database connected.");

    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error("[SERVER] Auth Failed: No session or user found.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.log(`[SERVER] User Authenticated. User ID: ${session.user.id}`);

    // 2. Parse request body
    const body = await req.json();
    console.log("[SERVER] Incoming Payload:", body);

    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = body;

    // Smart check: Use order_id if present, otherwise use subscription_id
    const referenceId = razorpay_order_id || razorpay_subscription_id;

    console.log("[SERVER] Extracted IDs:", {
      payment_id: razorpay_payment_id,
      subscription_id: razorpay_subscription_id,
      order_id: razorpay_order_id,
      reference_id_used: referenceId,
      signature: razorpay_signature
    });

    if (!razorpay_payment_id || !referenceId || !razorpay_signature) {
      console.error("[SERVER] Validation Failed: Missing required parameters.");
      return NextResponse.json(
        { success: false, message: "Missing required payment parameters." },
        { status: 400 }
      );
    }

    // 3. Find the subscription in MongoDB
    console.log(`[SERVER] Searching DB for record with ID: ${referenceId} and UserId: ${session.user.id}`);
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId: referenceId,
      userId: session.user.id,
    });

    if (!subscription) {
      console.error("[SERVER] DB Lookup Failed: Payment record not found.");
      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404 }
      );
    }
    console.log("[SERVER] DB Record Found:", { id: subscription._id, status: subscription.status });

    // 4. Verify HMAC SHA256 Signature
    let textToVerify;
    if (razorpay_order_id) {
      // Formula for Orders
      textToVerify = `${razorpay_order_id}|${razorpay_payment_id}`;
    } else {
      // Formula for Subscriptions
      textToVerify = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    }
    
    console.log(`[SERVER] Hashing String: "${textToVerify}"`);

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(textToVerify)
      .digest("hex");

    console.log("[SERVER] Signature Comparison:", {
      generated: generatedSignature,
      received: razorpay_signature,
      match: generatedSignature === razorpay_signature
    });

    if (generatedSignature !== razorpay_signature) {
      console.error("[SERVER] Verification Failed: Signatures do not match!");
      return NextResponse.json(
        { success: false, message: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // 5. Update local status
    if (subscription.status === "created") {
      console.log("[SERVER] Updating DB record status to 'authenticated'...");
      subscription.status = "authenticated";
      await subscription.save();
      console.log("[SERVER] DB record saved successfully.");
    } else {
      console.log(`[SERVER] DB record already has status: ${subscription.status}. Skipping save.`);
    }

    console.log("========== [SERVER] Verification Successful ==========\n");
    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully.",
    });

  } catch (error) {
    console.error("\n========== [SERVER] EXCEPTION CAUGHT ==========");
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during verification.",
      },
      { status: 500 }
    );
  }
}