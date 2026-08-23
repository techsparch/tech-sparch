import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import SubscriptionModel from "@/model/payment/subscription.model";
import { signAccessToken, signRefreshToken } from "@/helper/jwt/jwt";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_GENERATION_RETRIES = 10;

/**
 * Create registration code
 * Example: REG-ABCD34
 */
function createRegistrationCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARACTERS[crypto.randomInt(CHARACTERS.length)];
  }
  return `REG-${code}`;
}

/**
 * Generate a unique registration code with a retry limit
 */
async function generateUniqueRegistrationCode() {
  let attempts = 0;
  while (attempts < MAX_GENERATION_RETRIES) {
    const registrationId = createRegistrationCode();
    const exists = await UserModel.exists({ newRegId: registrationId });
    if (!exists) return registrationId;
    attempts++;
  }
  throw new Error("Failed to generate a unique registration code.");
}

/**
 * Create login access code
 */
function createAccessCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARACTERS[crypto.randomInt(CHARACTERS.length)];
  }
  return `TS-${code}`;
}

/**
 * Generate unique login access code with a retry limit
 */
async function generateUniqueAccessCode() {
  let attempts = 0;
  while (attempts < MAX_GENERATION_RETRIES) {
    const accessCode = createAccessCode();
    const exists = await UserModel.exists({ accessCode });
    if (!exists) return accessCode;
    attempts++;
  }
  throw new Error("Failed to generate a unique access code.");
}

export async function POST(req) {
  try {
    const { name, mobile, password, email, shopName } = await req.json();

    // Basic validation
    if (!mobile || !password) {
      return NextResponse.json( 
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check existing user
    const existingUser = await UserModel.exists({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 } // 409 Conflict is more semantically correct than 400
      );
    }

    // Generate everything concurrently
   // Generate everything concurrently
    const [hashedPassword, accessCode, registrationId] = await Promise.all([
      bcrypt.hash(password, 10),
      generateUniqueAccessCode(),
      generateUniqueRegistrationCode(),
    ]);
    const newUser = await UserModel.create({
      name,
      mobile,
      password: hashedPassword,
      email,
      role: "client",
      assignedCaId: "6a804c29adf0aa38239f4cba",
      newRegId: registrationId,
      accessCode,
      shopName,
    });

    const subscription = await SubscriptionModel.findOne({
      userId: newUser._id,
    });

    // Generate tokens
    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          role: newUser.role,
          name: newUser.name,
          registrationId: newUser.newRegId,
          subscription: subscription?.serviceEnabled || false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    
    // Catch Mongoose unique constraint errors (code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate field detected (e.g., mobile number already in use)." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}