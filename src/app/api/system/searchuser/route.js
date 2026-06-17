import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import UserModel from "@/model/user/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);
    if (!verifySession) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 30;

    // If someone calls this API without a query, return an empty array safely
    if (!query) {
      return NextResponse.json(
        {
          message: "Success",
          data: [],
          totalUsers: 0,
          currentPage: 1,
          totalPages: 0,
        },
        { status: 200 },
      );
    }

    const skip = (page - 1) * limit;

    // Apply the $or search logic specifically for this route
    const queryFilter = {
      role: "client", // Keep your base filter if needed
      $or: [
        // Matches if the name contains the search text
        { name: { $regex: query, $options: "i" } },

        // Matches if the email contains the search text
        { email: { $regex: query, $options: "i" } },

        // Matches if the mobile number contains the search text
        { mobile: { $regex: query, $options: "i" } },
      ],
    };

    const [users, totalUsers] = await Promise.all([
      UserModel.find(queryFilter)
        .populate("assignedCaId", "name email")
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      UserModel.countDocuments(queryFilter),
    ]);

    return NextResponse.json(
      {
        message: "Success",
        data: users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/system/searchuser error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
