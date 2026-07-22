import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import { NextResponse } from "next/server";
import UserModel from "@/model/user/user.model";

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    // 1. Check if session and user ID exist
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 }, // FIX: Changed from 201 to 401 (Unauthorized)
      );
    }

    const managerId = session.user.id;

    const staffMembers = await UserModel.find({
      assignedCaId: managerId,
      role: "staff",
    }).select("+accessCode");

    // FIX: Do NOT return 404 here. An empty array is a successful response!
    if (!staffMembers || staffMembers.length === 0) {
      return NextResponse.json(
        {
          staffMembers: [],
          message: "No staff mapped to this Account Manager",
          success: true, // Tell TanStack Query it succeeded
        },
        { status: 200 }, // Change to 200 to stop the 3x retries
      );
    }

    return NextResponse.json({ staffMembers, success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { staffId } = await request.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 },
      );
    }

    const managerId = session.user.id;

    // SECURITY: Use findOneAndDelete with both _id and assignedCaId
    const deletedStaff = await UserModel.findOneAndDelete({
      _id: staffId,
      assignedCaId: managerId,
    });

    if (!deletedStaff) {
      return NextResponse.json(
        {
          message: "Staff not found or unauthorized to delete",
          success: false,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Staff member deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error deleting staff:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
