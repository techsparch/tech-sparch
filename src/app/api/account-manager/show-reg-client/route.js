import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";

export async function GET(request) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    // 1. Verify session
    if (!verifySession || verifySession.user.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.max(parseInt(searchParams.get("limit")) || 9, 1);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const DEFAULT_CA_ID = "6a804c29adf0aa38239f4cba";

    // 2. Define the base query
    const query = {
      newRegId: { $exists: true, $ne: null },
      role: "client",
      assignedCaId: DEFAULT_CA_ID,
    };

    // 3. Add search filter if a search query is provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // 4. Fetch users and total count concurrently for performance
    const [unassignedClients, totalClients] = await Promise.all([
      UserModel.find(query)
        .select("_id  name email mobile") 
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);

    // 5. Return directly without modifying the objects
    return NextResponse.json(
      {
        success: true,
        data: unassignedClients,
        totalUsers: totalClients,
        currentPage: page,
        totalPages: Math.ceil(totalClients / limit),
        limit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Unassigned Clients Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
