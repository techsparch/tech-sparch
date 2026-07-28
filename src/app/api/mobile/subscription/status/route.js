import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getUser } from "@/helper/auth/auth";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function GET(request) {
  try {
   
    await connectDB();

    // 1. Authenticate the user from the Bearer token
    const authUser = await getUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
   

    // 2. Fetch the most recent subscription document for this user
    const subscription = await SubscriptionModel.findOne({
      userId: authUser.id,
    }).sort({ createdAt: -1 });

   
    if (!subscription) {
      return NextResponse.json({ status: "none" }, { status: 200 });
    }

   

    // 4. Map the database status to the 4 states your UI understands
    // (none, active, grace_period, expired)
    let uiState = "none";
    const dbStatus = subscription.status;

    if (dbStatus === "active" || dbStatus === "authenticated") {
      uiState = "active";
    } else if (dbStatus === "past_due") {
      uiState = "grace_period";
    } else if (
      dbStatus === "expired" ||
      dbStatus === "cancelled" ||
      dbStatus === "halted"
    ) {
      uiState = "expired";
    } else if (dbStatus === "created") {
      uiState = "none"; // Document exists, but payment hasn't completed yet
    }

    // 5. Format dates for the UI (Handle nulls gracefully)
    let formattedRenewalDate = "Pending";
    if (subscription.nextRenewalAt) {
      // Formats as "25 Jul 2026"
      formattedRenewalDate = new Date(
        subscription.nextRenewalAt,
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // 6. Calculate exactly how many grace days are left based on timestamps
    let calculatedGraceDaysLeft = 0;
    if (subscription.gracePeriodEndsAt) {
      const now = new Date();
      const graceEnd = new Date(subscription.gracePeriodEndsAt);
      const diffTime = Math.max(0, graceEnd - now);
      // Convert milliseconds to days
      calculatedGraceDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json(
      {
        status: uiState,
        planName: subscription.planName ?? "Monthly Subscription",
        price: `₹${subscription.amount ?? 10}`,
        billingCycle: "month",
        nextRenewalDate: formattedRenewalDate,
        rawRenewalDate: subscription.nextRenewalAt ?? null,
        graceDaysLeft: calculatedGraceDaysLeft,
        serviceEnabled: Boolean(subscription.serviceEnabled),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Status Check API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching status.",
      },
      { status: 500 },
    );
  }
}
