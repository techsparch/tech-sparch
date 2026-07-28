import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getUser } from "@/helper/auth/auth";
import SubscriptionModel from "@/model/payment/subscription.model";
import razorpay from "@/lib/razorpay/razorpay";

// Must match the schema's actual enum values. "halted" is NOT a schema value —
// your webhook maps Razorpay's "subscription.halted" event to local status
// "expired", so "halted" here was dead code that could never match a document.
const CANCELLABLE_STATUSES = [
  "created",
  "authenticated",
  "active",
  "grace_period",
];

export async function POST(request) {
  try {
    await connectDB();

    const authUser = await getUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 1. Fetch active/pending subscription from DB.
    // userId is unique in the schema, so there's at most one document per
    // user — the sort is harmless but not strictly necessary.
    const subscription = await SubscriptionModel.findOne({
      userId: authUser.id,
      status: { $in: CANCELLABLE_STATUSES },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "No active or pending subscription found." },
        { status: 400 },
      );
    }

    const previousStatus = subscription.status;
    const rzpSubscriptionId = subscription.razorpaySubscriptionId;

    // 2. Call Razorpay Cancel API (if a Razorpay subscription ID exists)
    if (rzpSubscriptionId) {
      try {
        /*
          cancel_at_cycle_end: false -> Cancel immediately (stops retries right now)
          cancel_at_cycle_end: true  -> Allow user access until current cycle ends
        */
        const cancelAtCycleEnd = previousStatus === "active"; // Only wait for cycle end if active

        await razorpay.subscriptions.cancel(
          rzpSubscriptionId,
          cancelAtCycleEnd,
        );
      } catch (rzpError) {
        console.error("Razorpay API Cancellation Failed:", rzpError);

        // If Razorpay says subscription is already cancelled/expired, allow local cleanup
        if (rzpError?.error?.code !== "BAD_REQUEST_ERROR") {
          return NextResponse.json(
            {
              success: false,
              message:
                rzpError?.error?.description ||
                "Failed to cancel with payment provider.",
            },
            { status: 400 },
          );
        }
      }
    }

    // 3. Update DB state atomically.
    // Filter includes the same status condition as our initial read so this
    // write only applies if the document is still in a cancellable state
    // (guards against a race with e.g. a webhook that already moved it to
    // "expired"/"cancelled" between step 1 and now).
    //
    // IMPORTANT: serviceEnabled must be turned off here — the original code
    // set status/cancelledAt but left serviceEnabled untouched, which meant
    // a cancelled user kept access indefinitely (serviceEnabled stayed true
    // from whatever it was set to during "active").
    const updated = await SubscriptionModel.findOneAndUpdate(
      {
        _id: subscription._id,
        status: { $in: CANCELLABLE_STATUSES },
      },
      {
        $set: {
          status: "cancelled",
          serviceEnabled: false,
          cancelledAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      // Lost the race — something else (e.g. a webhook) already moved this
      // subscription out of a cancellable state between our read and write.
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription was already updated elsewhere. Please refresh and try again.",
        },
        { status: 409 },
      );
    }

    // 4. Construct user response message
    let responseMessage = "Subscription cancelled successfully.";
    if (previousStatus === "created") {
      responseMessage = "Pending subscription request has been discarded.";
    } else if (previousStatus === "active") {
      responseMessage =
        "Subscription cancelled. Auto-renewal has been turned off.";
    } else if (previousStatus === "grace_period") {
      responseMessage =
        "Subscription cancelled. Payment retries have been stopped.";
    } else if (previousStatus === "authenticated") {
      responseMessage =
        "Subscription cancelled before the first payment was collected.";
    }

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cancel Subscription Endpoint Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while processing cancellation.",
      },
      { status: 500 },
    );
  }
}
