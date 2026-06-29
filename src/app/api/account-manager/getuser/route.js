import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";

export async function GET(request) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (!verifySession || verifySession.user.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.max(parseInt(searchParams.get("limit")) || 9, 1);

    const skip = (page - 1) * limit;

    const assignedCaId = verifySession.user.id;

    const [users, totalClients] = await Promise.all([
      UserModel.find({ assignedCaId })
        .populate("assignedCaId", "name")
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      UserModel.countDocuments({ assignedCaId }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        totalUsers: totalClients,
        currentPage: page,
        totalPages: Math.ceil(totalClients / limit),
        limit,
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
