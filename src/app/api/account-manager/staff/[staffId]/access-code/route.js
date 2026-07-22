import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import UserModel from "@/model/user/user.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 },
      );
    }

    const { staffId } = await params;
    const managerId = session.user.id;

    const staff = await UserModel.findOne({
      _id: staffId,
      assignedCaId: managerId,
    })
      .select("accessCode")
      .lean();

    if (!staff) {
      return NextResponse.json(
        { message: "Staff not found or unauthorized", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { accessCode: staff.accessCode, success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error fetching access code:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
