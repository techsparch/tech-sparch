import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";

export async function GET(request) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (!verifySession || verifySession.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.max(parseInt(searchParams.get("limit")) || 9, 1);
    // 1. Extract the search term from the URL
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const staffId = verifySession.user.id;

    const staffData = await UserModel.findById(staffId)
      .select("+assignedCaId +hasFullAccess")
      .lean();

    if (!staffData || !staffData.assignedCaId) {
      return NextResponse.json(
        { message: "Staff assignment not found" },
        { status: 404 },
      );
    }

    const assignedCaId = staffData.assignedCaId;

    // 2. Build the base query
    const query = {
      assignedCaId: assignedCaId,
      role: "client",
    };

    // 3. If a search term exists, add the $or conditions using regex for partial matching
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
      ];
    }

    // 4. Pass the dynamic 'query' object into both find() and countDocuments()
    const [users, totalClients] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

      UserModel.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        hasFullAccess: staffData.hasFullAccess || false,
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
