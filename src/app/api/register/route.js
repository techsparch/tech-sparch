import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import crypto from "crypto";

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
    // 1. Authenticate early to reject unauthorized requests immediately
    const verifySession = await getServerSession(authOptions);

    if (!verifySession?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

    // 2. Parse and validate input BEFORE hitting the database
    const { name, mobile, password, email, role } = await req.json();

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

    // 3. Connect to DB only after all basic validations pass
    await connectDB();

    // 4. Use .exists() instead of .findOne() for a lighter query
    const existingUser = await UserModel.exists({ mobile });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 5. Run time-consuming tasks concurrently
    const [hashedPassword, accessCode] = await Promise.all([
      bcrypt.hash(password, 10),
      generateUniqueAccessCode(),
    ]);

    // 6. Create the user
    const newUser = await UserModel.create({
      name,
      mobile,
      password: hashedPassword,
      email,
      role,
      assignedCaId: verifySession.user.id,
      accessCode,
    });

    // 7. Return 201 Created status code
    return NextResponse.json(
      {
        success: true,
        userId: newUser._id,
        accessCode,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
