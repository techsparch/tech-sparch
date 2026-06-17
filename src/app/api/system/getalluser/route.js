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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 30;

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 1. Store the filter in a variable so it perfectly matches both queries
    const queryFilter = { role: "client" };

    const [users, totalUsers] = await Promise.all([
      UserModel.find(queryFilter)
        // THE MAGIC: Populate pulls the CA document.
        // The second string "name email" ensures we only get exactly what we need, saving bandwidth!
        .populate("assignedCaId", "name ")
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      // FIXED: Now we only count total clients, ensuring pagination math is correct
      UserModel.countDocuments(queryFilter),
    ]);

    // 2. Return just the users array
    return NextResponse.json(
      {
        message: "Success",
        data: users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/system/getuser error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
