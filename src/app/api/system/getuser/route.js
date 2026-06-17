import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";

export async function GET(request) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (!verifySession) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

    const [users, totalUsers, roleCounts] = await Promise.all([
      UserModel.find()
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .limit(9),
      UserModel.countDocuments(),
      UserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    // fix #1 — return all three in the response
    return NextResponse.json(
      {
        message: "Success",
        data: users,
        totalUsers,
        roleCounts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
