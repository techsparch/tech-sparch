import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import SubscriptionModel from "@/model/payment/subscription.model";
import { signAccessToken, signRefreshToken } from "@/helper/jwt/jwt";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARACTERS[crypto.randomInt(CHARACTERS.length)];
  }
  return `TS-${code}`;
}

export async function generateUniqueAccessCode() {
  while (true) {
    const code = createCode();
    const exists = await UserModel.exists({ loginWithAccessCode: code });
    if (!exists) return code;
  }
}

export async function POST(req) {
  try {
    // 1. Parse and validate input BEFORE hitting the database
    const { name, mobile, password, email, shopName } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // 2. Connect to DB only after all basic validations pass
    await connectDB();

    // 3. Use .exists() instead of .findOne() for a lighter query
    const existingUser = await UserModel.exists({ mobile });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 4. Run time-consuming tasks concurrently
    const [hashedPassword, accessCode] = await Promise.all([
      bcrypt.hash(password, 10),
      generateUniqueAccessCode(),
    ]);

    // 5. Create the user
    const newUser = await UserModel.create({
      name,
      mobile,
      password: hashedPassword,
      email,
      role: "client",
      assignedCaId: "6a30efe705c4bf113d367c7d",
      accessCode,
      shopName,
    });

    // 6. Fix: Use `newUser` instead of `user`
    const subscription = await SubscriptionModel.findOne({ userId: newUser._id });

    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        role: newUser.role,
        name: newUser.name,
        subscription: subscription?.serviceEnabled || false,
      },
    }, { status: 201 }); // Added status 201 Created
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}