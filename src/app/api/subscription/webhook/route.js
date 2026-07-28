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
    const paymentMethod = event.payload?.payment?.entity?.method ?? null;
    const razorpayCustomerId = payloadEntity.customer_id ?? null;

    console.log(`[${debugId}] Razorpay subscription ID:`, razorpaySubscriptionId);
    console.log(`[${debugId}] Subscription status from Razorpay:`, payloadEntity.status);
    console.log(`[${debugId}] Payment method:`, paymentMethod);
    console.log(`[${debugId}] current_start:`, payloadEntity.current_start, "->", payloadEntity.current_start ? new Date(payloadEntity.current_start * 1000).toISOString() : null);
    console.log(`[${debugId}] current_end:`, payloadEntity.current_end, "->", payloadEntity.current_end ? new Date(payloadEntity.current_end * 1000).toISOString() : null);
    console.log(`[${debugId}] charge_at:`, payloadEntity.charge_at, "->", payloadEntity.charge_at ? new Date(payloadEntity.charge_at * 1000).toISOString() : null);
    console.log(`[${debugId}] paid_count:`, payloadEntity.paid_count);
    console.log(`[${debugId}] total_count:`, payloadEntity.total_count);

    // Confirm the subscription exists locally (lean read, no mutation).
    const existing = await SubscriptionModel.findOne(
      { razorpaySubscriptionId },
      { status: 1, graceDays: 1 }, // projection: only need these for logging / grace calc
    ).lean();

    if (!existing) {
      console.log(
        `[${debugId}] ⚠️ No local subscription found for razorpaySubscriptionId="${razorpaySubscriptionId}". ` +
          `Check: does your DB actually store this exact ID? Log it when you create the subscription too.`,
      );
      return NextResponse.json(
        { received: true, message: "Subscription not found locally" },
        { status: 200 },
      );
    }

    console.log(`[${debugId}] Found local subscription. Current local status:`, existing.status);

    // 4. Handle Lifecycle Events — via atomic findOneAndUpdate
    //
    // Razorpay does not guarantee webhook delivery order (retries, resends from
    // the dashboard, and network delays can all cause an "earlier" lifecycle
    // event to arrive AFTER a "later" one). Without a precedence guard, a
    // stale "authenticated" event arriving after "activated" will blindly
    // overwrite status back to "authenticated" while leaving the
    // active-period fields populated (which is the bug you hit).
    //
    // Rather than find() -> mutate -> save() (which reads status, then writes
    // it back, leaving a race window where two concurrent webhook calls can
    // both read the same stale status before either saves), we push the
    // status check directly into the findOneAndUpdate FILTER. Mongo evaluates
    // the filter and applies the update as a single atomic operation, so a
    // concurrent request can never sneak in an out-of-order write between our
    // read and our write.
    //
    // NON_TERMINAL: statuses an event is allowed to transition away from.
    // Once a subscription is "expired" or "cancelled", nothing below (except
    // an explicit "cancelled" event) is allowed to move it anywhere else.
    const NON_TERMINAL = ["created", "authenticated", "active", "grace_period"];

    let matchedCase = true;
    let updated = null;

    switch (eventType) {
      case "subscription.authenticated": {
        // Only allowed to move into "authenticated" from an earlier-stage
        // status — never from "active"/"grace_period"/terminal states.
        updated = await SubscriptionModel.findOneAndUpdate(
          {
            razorpaySubscriptionId,
            status: { $in: ["created", "authenticated"] },
          },
          { $set: { status: "authenticated" } },
          { returnDocument: "after" },
        );
        break;
      }

      case "subscription.activated":
      case "subscription.charged": {
        const setFields = {
          status: "active",
          serviceEnabled: true,
          activatedAt: new Date(),
          lastPaymentAt: new Date(),
          currentPeriodStart: new Date(payloadEntity.current_start * 1000),
          currentPeriodEnd: new Date(payloadEntity.current_end * 1000),
          nextRenewalAt: new Date(payloadEntity.charge_at * 1000),
          gracePeriodEndsAt: null,
        };
        // Only set these if Razorpay actually sent a value — avoid
        // overwriting a previously known value with null on later events.
        if (paymentMethod) setFields.paymentMethod = paymentMethod;
        if (razorpayCustomerId) setFields.razorpayCustomerId = razorpayCustomerId;

        updated = await SubscriptionModel.findOneAndUpdate(
          {
            razorpaySubscriptionId,
            status: { $in: NON_TERMINAL },
          },
          { $set: setFields },
          { returnDocument: "after" },
        );
        break;
      }

      case "subscription.pending":
      case "invoice.payment_failed": {
        const graceDays = existing.graceDays || 7;
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + graceDays);

        updated = await SubscriptionModel.findOneAndUpdate(
          {
            razorpaySubscriptionId,
            status: { $in: NON_TERMINAL },
          },
          {
            $set: { status: "grace_period", gracePeriodEndsAt: graceEnd },
          },
          { returnDocument: "after" },
        );
        break;
      }

      case "subscription.halted": {
        updated = await SubscriptionModel.findOneAndUpdate(
          {
            razorpaySubscriptionId,
            status: { $in: NON_TERMINAL },
          },
          { $set: { status: "expired", serviceEnabled: false } },
          { returnDocument: "after" },
        );
        break;
      }

      case "subscription.cancelled": {
        // Cancellation is always allowed through — no status filter — since
        // it reflects an explicit user/merchant action and should win over
        // any other state.
        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId },
          {
            $set: {
              status: "cancelled",
              serviceEnabled: false,
              cancelledAt: new Date(),
            },
          },
          { returnDocument: "after" },
        );
        break;
      }

      default:
        matchedCase = false;
        console.log(
          `[${debugId}] ⚠️ Event type "${eventType}" did not match any case in the switch. ` +
            `No DB update performed. If you expected this event to do something, add a case for it.`,
        );
    }

    if (matchedCase) {
      if (updated) {
        console.log(`[${debugId}] -> Updated. New status:`, updated.status);
      } else {
        // findOneAndUpdate returned null: either the doc vanished between our
        // existence check and now (unlikely), or — far more commonly — the
        // status filter didn't match, meaning this event is stale/out-of-order
        // and was correctly rejected.
        console.log(
          `[${debugId}] ⚠️ Update did not apply for "${eventType}" — local status "${existing.status}" is not a valid source state for this event (stale/out-of-order webhook, safely ignored).`,
        );
      }
    }

    console.log(`[${debugId}] ========== END ==========\n`);

    return NextResponse.json(
      {
        success: true,
        received: true,
        matchedCase,
        applied: !!updated,
        eventType,
      },
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