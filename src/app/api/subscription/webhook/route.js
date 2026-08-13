import crypto from "crypto";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";
import InvoiceModel from "@/model/payment/invoice.model";

export async function POST(req) {
  const debugId = crypto.randomUUID().slice(0, 8);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ message: "Missing signature" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Missing webhook secret" }, { status: 500 });
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log(`[${debugId}] ❌ REJECTED: Signature mismatch`);
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // 2. Parse Payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    await connectDB();


 
    if (eventType === "invoice.paid") {
      const invoiceData = event.payload?.invoice?.entity;
      
      if (invoiceData && invoiceData.subscription_id) {
        const subId = invoiceData.subscription_id;
        
        // Find the user who owns this subscription
        const existingSub = await SubscriptionModel.findOne({ razorpaySubscriptionId: subId }).lean();

        if (existingSub) {
          await InvoiceModel.findOneAndUpdate(
            { invoiceId: invoiceData.id },
            {
              userId: existingSub.userId,
              subscriptionId: subId,
              invoiceId: invoiceData.id,
              amount: invoiceData.amount / 100, // Convert paise to rupees
              currency: invoiceData.currency,
              status: invoiceData.status,
              pdfUrl: invoiceData.short_url, // Link to the Razorpay PDF
              billingStart: invoiceData.billing_start ? new Date(invoiceData.billing_start * 1000) : null,
              billingEnd: invoiceData.billing_end ? new Date(invoiceData.billing_end * 1000) : null,
              issuedAt: new Date(invoiceData.issued_at * 1000),
            },
            { upsert: true, new: true }
          );
        }
      }

      // Exit early: Invoice events don't contain the subscription entity data needed below
      return NextResponse.json({ success: true, message: "Invoice processed" }, { status: 200 });
    }

    // ==========================================
    // 4. SUBSCRIPTION LIFECYCLE HANDLER
    // ==========================================
    const payloadEntity = event.payload?.subscription?.entity;

    if (!payloadEntity) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const razorpaySubscriptionId = payloadEntity.id;
    const paymentMethod = event.payload?.payment?.entity?.method ?? null;
    const razorpayCustomerId = payloadEntity.customer_id ?? null;

    const NON_TERMINAL = ["created", "authenticated", "active", "grace_period"];
    let updated = null;

    switch (eventType) {
      case "subscription.authenticated":
        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId, status: { $in: ["created", "authenticated"] } },
          { $set: { status: "authenticated" } }
        );
        break;

      case "subscription.activated":
      case "subscription.charged":
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
        if (paymentMethod) setFields.paymentMethod = paymentMethod;
        if (razorpayCustomerId) setFields.razorpayCustomerId = razorpayCustomerId;

        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId, status: { $in: NON_TERMINAL } },
          { $set: setFields }
        );
        break;

      case "subscription.pending":
      case "invoice.payment_failed":
        const existing = await SubscriptionModel.findOne({ razorpaySubscriptionId }).lean();
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + (existing?.graceDays || 7));

        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId, status: { $in: NON_TERMINAL } },
          { $set: { status: "grace_period", gracePeriodEndsAt: graceEnd } }
        );
        break;

      case "subscription.halted":
        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId, status: { $in: NON_TERMINAL } },
          { $set: { status: "expired", serviceEnabled: false } }
        );
        break;

      case "subscription.cancelled":
        updated = await SubscriptionModel.findOneAndUpdate(
          { razorpaySubscriptionId },
          { $set: { status: "cancelled", serviceEnabled: false, cancelledAt: new Date() } }
        );
        break;
    }

    return NextResponse.json({ success: true, applied: !!updated }, { status: 200 });

  } catch (error) {
    console.error(`[${debugId}] ❌ WEBHOOK ERROR:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}