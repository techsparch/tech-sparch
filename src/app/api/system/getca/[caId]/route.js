import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";
import UserModel from "@/model/user/user.model";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const { caId } = await params;
    if (!caId) {
      return NextResponse.json(
        { success: false, message: "CA ID parameter is required." },
        { status: 400 }
      );
    }

    // 1. Fetch CA and clients first
    const [ca, clients] = await Promise.all([
      UserModel.findOne({ _id: caId, role: "ca" })
        .select("_id name email mobile role createdAt")
        .lean(),
      UserModel.find({ assignedCaId: caId, role: "client" })
        .select("_id name email mobile role createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!ca) {
      return NextResponse.json(
        { success: false, message: "Chartered Accountant not found." },
        { status: 404 }
      );
    }

    // Extract all client User IDs
    const clientIds = clients.map((client) => client._id);

    // 2. Fetch Subscriptions for CA and all Clients in parallel
    const [caSubscription, clientSubscriptions] = await Promise.all([
      // CA Subscription (by assignedCaId or userId)
      SubscriptionModel.findOne({ assignedCaId: caId })
        .sort({ createdAt: -1 })
        .lean(),

      // All Client Subscriptions matching client IDs
      SubscriptionModel.find({ userId: { $in: clientIds } })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Create a map for fast lookup of client subscriptions by userId
    const subscriptionMap = new Map();
    clientSubscriptions.forEach((sub) => {
      // Keep only the latest subscription if multiple exist per user
      if (!subscriptionMap.has(sub.userId.toString())) {
        subscriptionMap.set(sub.userId.toString(), sub);
      }
    });

    // 3. Attach subscription data (or "not initialized") to each client
    const clientsWithSubscription = clients.map((client) => {
      const sub = subscriptionMap.get(client._id.toString());

      return {
        ...client,
        subscription: sub
          ? {
              _id: sub._id,
              planName: sub.planName,
              status: sub.status || "not initialized",
              amount: sub.amount,
              currency: sub.currency,
              currentPeriodEnd: sub.currentPeriodEnd,
            }
          : {
              planName: null,
              status: "not initialized",
              amount: 0,
              currency: "INR",
              currentPeriodEnd: null,
            },
      };
    });

    // 4. Format CA subscription details
    const formattedCaSubscription = caSubscription
      ? {
          _id: caSubscription._id,
          planName: caSubscription.planName,
          status: caSubscription.status || "not initialized",
          amount: caSubscription.amount,
          currency: caSubscription.currency,
          currentPeriodEnd: caSubscription.currentPeriodEnd,
        }
      : {
          planName: null,
          status: "not initialized",
          amount: 0,
          currency: "INR",
          currentPeriodEnd: null,
        };

    // 5. Final Response
    return NextResponse.json(
      {
        success: true,
        ca,
        subscription: formattedCaSubscription,
        clients: clientsWithSubscription,
        totalClients: clientsWithSubscription.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching CA and client subscription details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}