import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function POST(req) {
  const debugId = crypto.randomUUID().slice(0, 8); // tag every log line for this request
  console.log(`\n========== [${debugId}] WEBHOOK HIT ==========`);
  console.log(`[${debugId}] Time:`, new Date().toISOString());

  try {
    // 1. Read raw body as text for webhook signature validation
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    console.log(`[${debugId}] Signature header present:`, !!signature);
    console.log(`[${debugId}] Raw body length:`, rawBody.length);

    if (!signature) {
      console.log(`[${debugId}] ❌ REJECTED: Missing signature header`);
      return NextResponse.json(
        { message: "Missing Razorpay signature" },
        { status: 400 },
      );
    }

    // 2. Verify Webhook Signature using Webhook Secret
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.log(`[${debugId}] ❌ CRITICAL: RAZORPAY_WEBHOOK_SECRET env var is not set!`);
      return NextResponse.json(
        { message: "Server misconfigured: missing webhook secret" },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    console.log(`[${debugId}] Signature match:`, expectedSignature === signature);

    if (expectedSignature !== signature) {
      console.log(`[${debugId}] ❌ REJECTED: Signature mismatch`);
      console.log(`[${debugId}] Expected: ${expectedSignature}`);
      console.log(`[${debugId}] Received: ${signature}`);
      console.log(
        `[${debugId}] 👉 Check: are you using the correct webhook secret? ` +
          `Test mode and Live mode have DIFFERENT secrets. ` +
          `Also check if you have multiple webhooks configured with different secrets.`,
      );
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    // 3. Parse event data
    const event = JSON.parse(rawBody);
    await connectDB();

    const eventType = event.event;
    console.log(`[${debugId}] ✅ Signature verified`);
    console.log(`[${debugId}] Event type:`, eventType);
    console.log(`[${debugId}] Full payload keys:`, Object.keys(event.payload || {}));

    // Log the ENTIRE raw event so you can inspect exact structure in your logs
    console.log(`[${debugId}] FULL EVENT PAYLOAD:`, JSON.stringify(event, null, 2));

    // Guard against events that don't carry a subscription entity
    const payloadEntity = event.payload?.subscription?.entity;

    if (!payloadEntity) {
      console.log(
        `[${debugId}] ⚠️ No payload.subscription.entity found for event "${eventType}". ` +
          `This event likely nests data elsewhere (e.g. payload.payment.entity or payload.invoice.entity). ` +
          `Skipping without error.`,
      );
      return NextResponse.json(
        { received: true, message: "No subscription entity in this event" },
        { status: 200 },
      );
    }

    const razorpaySubscriptionId = payloadEntity.id;
    console.log(`[${debugId}] Razorpay subscription ID:`, razorpaySubscriptionId);
    console.log(`[${debugId}] Subscription status from Razorpay:`, payloadEntity.status);
    console.log(`[${debugId}] current_start:`, payloadEntity.current_start, "->", payloadEntity.current_start ? new Date(payloadEntity.current_start * 1000).toISOString() : null);
    console.log(`[${debugId}] current_end:`, payloadEntity.current_end, "->", payloadEntity.current_end ? new Date(payloadEntity.current_end * 1000).toISOString() : null);
    console.log(`[${debugId}] charge_at:`, payloadEntity.charge_at, "->", payloadEntity.charge_at ? new Date(payloadEntity.charge_at * 1000).toISOString() : null);
    console.log(`[${debugId}] paid_count:`, payloadEntity.paid_count);
    console.log(`[${debugId}] total_count:`, payloadEntity.total_count);

    // Find local subscription
    const subscription = await SubscriptionModel.findOne({
      razorpaySubscriptionId,
    });

    if (!subscription) {
      console.log(
        `[${debugId}] ⚠️ No local subscription found for razorpaySubscriptionId="${razorpaySubscriptionId}". ` +
          `Check: does your DB actually store this exact ID? Log it when you create the subscription too.`,
      );
      return NextResponse.json(
        { received: true, message: "Subscription not found locally" },
        { status: 200 },
      );
    }

    console.log(`[${debugId}] Found local subscription. Current local status:`, subscription.status);

    // 4. Handle Lifecycle Events
    let matchedCase = true;
    switch (eventType) {
      case "subscription.authenticated":
        subscription.status = "authenticated";
        await subscription.save();
        console.log(`[${debugId}] -> Set status to "authenticated"`);
        break;

      case "subscription.activated":
      case "subscription.charged": {
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
        subscription.gracePeriodEndsAt = null;
        await subscription.save();
        console.log(`[${debugId}] -> Set status to "active", serviceEnabled=true`);
        break;
      }

      case "subscription.pending":
      case "invoice.payment_failed": {
        subscription.status = "grace_period";
        const graceDays = subscription.graceDays || 7;
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + graceDays);
        subscription.gracePeriodEndsAt = graceEnd;
        await subscription.save();
        console.log(`[${debugId}] -> Set status to "grace_period", ends`, graceEnd.toISOString());
        break;
      }

      case "subscription.halted": {
        subscription.status = "expired";
        subscription.serviceEnabled = false;
        await subscription.save();
        console.log(`[${debugId}] -> Set status to "expired"`);
        break;
      }

      case "subscription.cancelled": {
        subscription.status = "cancelled";
        subscription.serviceEnabled = false;
        subscription.cancelledAt = new Date();
        await subscription.save();
        console.log(`[${debugId}] -> Set status to "cancelled"`);
        break;
      }

      default:
        matchedCase = false;
        console.log(
          `[${debugId}] ⚠️ Event type "${eventType}" did not match any case in the switch. ` +
            `No DB update performed. If you expected this event to do something, add a case for it.`,
        );
    }

    console.log(`[${debugId}] Final local status after handling:`, subscription.status);
    console.log(`[${debugId}] ========== END ==========\n`);

    return NextResponse.json(
      { success: true, received: true, matchedCase, eventType },
      { status: 200 },
    );
  } catch (error) {
    console.error(`[${debugId}] ❌ WEBHOOK ERROR:`, error);
    console.error(`[${debugId}] Stack:`, error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}