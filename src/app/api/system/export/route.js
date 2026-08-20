import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";
import SubscriptionModel from "@/model/payment/subscription.model";

export async function GET(request) {
  try {
    await connectDB();



    const verifySession = await getServerSession(authOptions);

    if (!verifySession || verifySession.user.role !== "system") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [users, totalClients] = await Promise.all([
      UserModel.find({ assignedCaId: verifySession.user.id, role: "client" })
        .populate("assignedCaId", "name")
        .select(
          "name mobile email isActive  shopName businessType gstNumber panNumber address role createdAt",
        )
        .sort({ createdAt: -1 })
        .limit(500),
      UserModel.countDocuments({ assignedCaId: verifySession.user.id }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        totalUsers: totalClients,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
