import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/option";
import bcrypt from "bcryptjs"; // Make sure to: npm install bcryptjs
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";

export async function POST(req) {
  try {
    // 1. Ensure database connection is established first
    await connectDB()

    const session = await getServerSession(authOptions);

    const staffId = session?.user?.id || session?.user?._id;

    if (!staffId) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in." },
        { status: 401 },
      );
    }

    const staffMember =
      await UserModel.findById(staffId).select("role assignedCaId");

    if (!staffMember || staffMember.role !== "staff") {
      return NextResponse.json(
        { message: "Forbidden: Only staff can create clients." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      mobile,
      password,
      shopName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bio,
    } = body;

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { message: "Name, Mobile, and Password are required." },
        { status: 400 },
      );
    }

    const existingUser = await UserModel.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this mobile number already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await UserModel.create({
      name,
      email,
      mobile,
      password: hashedPassword, // Store the hashed version
      shopName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bio,

      role: "client",
      assignedCaId: staffMember.assignedCaId,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Client created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
