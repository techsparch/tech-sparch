import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/dbconnection/db";
import { getUser } from "@/helper/auth/auth";
import SubscriptionModel from "@/model/payment/subscription.model";
import razorpay from "@/lib/razorpay/razorpay";

const CANCELLABLE_STATUSES = [
  "created",
  "active",
  "grace_period",
  "halted",
  "authenticated",
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

    // 1. Fetch active/pending subscription from DB
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

    // 3. Update DB state
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    // 4. Construct user response message
    let responseMessage = "Subscription cancelled successfully.";
    if (previousStatus === "created") {
      responseMessage = "Pending subscription request has been discarded.";
    } else if (previousStatus === "active") {
      responseMessage =
        "Subscription cancelled. Auto-renewal has been turned off.";
    } else if (
      previousStatus === "grace_period" ||
      previousStatus === "halted"
    ) {
      responseMessage =
        "Subscription cancelled. Payment retries have been stopped.";
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
