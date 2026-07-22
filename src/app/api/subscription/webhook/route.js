import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function POST(req) {
  try {
    // 1. Read raw body as text for webhook signature validation
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing Razorpay signature" },
        { status: 400 },
      );
    }

    // 2. Verify Webhook Signature using Webhook Secret
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    // 3. Parse event data
    const event = JSON.parse(rawBody);
    await connectDB();

    const eventType = event.event;
    const payloadEntity = event.payload.subscription.entity;
    const razorpaySubscriptionId = payloadEntity.id;

    // Find local subscription
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId,
    });

    if (!subscription) {
      // Return 200 to Razorpay so it doesn't repeatedly retry an unknown local ID
      return NextResponse.json(
        { received: true, message: "Subscription not found locally" },
        { status: 200 },
      );
    }

    // 4. Handle Lifecycle Events
    switch (eventType) {
      case "subscription.authenticated":
        subscription.status = "authenticated";
        await subscription.save();
        break;

      case "subscription.activated":
      case "subscription.charged": {
        // Successful payment / activation
        subscription.status = "active";
        subscription.serviceEnabled = true;
        subscription.activatedAt = new Date();
        subscription.lastPaymentAt = new Date();
        subscription.currentPeriodStart = new Date(
          payloadEntity.current_start * 1000,
        );
        subscription.currentPeriodEnd = new Date(
          payloadEntity.current_end * 1000,
        );
        subscription.nextRenewalAt = new Date(payloadEntity.charge_at * 1000);
        subscription.gracePeriodEndsAt = null; // Clear any existing grace period
        await subscription.save();
        break;
      }

      case "subscription.pending":
      case "invoice.payment_failed": {
        // Payment failed - Enter 7-Day Grace Period
        subscription.status = "grace_period";
        const graceDays = subscription.graceDays || 7;
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + graceDays);
        subscription.gracePeriodEndsAt = graceEnd;
        // Services remain enabled during grace period
        await subscription.save();
        break;
      }

      case "subscription.halted": {
        // Grace period expired or subscription halted by Razorpay due to failure
        subscription.status = "expired";
        subscription.serviceEnabled = false;
        await subscription.save();
        break;
      }

      case "subscription.cancelled": {
        subscription.status = "cancelled";
        subscription.serviceEnabled = false;
        subscription.cancelledAt = new Date();
        await subscription.save();
        break;
      }

      default:
        console.log(`Unhandled Razorpay webhook event: ${eventType}`);
    }

    return NextResponse.json(
      { success: true, received: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
