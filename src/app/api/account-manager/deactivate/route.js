import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/user/user.model";

export async function PATCH(request) {
  try {
    await connectDB();
    const verifySession = await getServerSession(authOptions);

    // Verify session and role
    if (!verifySession || verifySession.user.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract the specific user ID and desired status from the request body
    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Find the specific user and update their status
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId,},
      { isActive: isActive },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Client account successfully ${isActive ? 'activated' : 'deactivated'}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}