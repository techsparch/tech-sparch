import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { name, mobile, password, email, role } = await req.json();

    // 🔴 Basic validation
    if (!mobile || !password) {
      return Response.json(
        { error: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // 🔍 Check existing user
    const existingUser = await UserModel.findOne({ mobile });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await UserModel.create({
      name,
      mobile,
      password: hashedPassword,
      email,
      role,
    });

    return Response.json({
      success: true,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
