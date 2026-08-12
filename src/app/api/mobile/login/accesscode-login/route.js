import { signAccessToken, signRefreshToken } from "@/helper/jwt/jwt";
import { connectDB } from "@/lib/dbconnection/db";
import SubscriptionModel from "@/model/payment/subscription.model";
import UserModel from "@/model/user/user.model";
import { NextResponse } from "next/server";

// Format: TS- followed by 4 uppercase letters/digits (e.g. TS-TX5B)
const ACCESS_CODE_REGEX = /^TS-[A-Z0-9]{4}$/;

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const accessCode = body?.accessCode;

    // Strict type + presence check — blocks NoSQL injection via
    // objects like { "$ne": null } or { "$gt": "" }
    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json(
        { msg: "Access code is required" },
        { status: 400 },
      );
    }

    const trimmedCode = accessCode.trim().toUpperCase();

    // Must match TS-XXXX format (fixed prefix + uppercase alphanumeric)
    if (!ACCESS_CODE_REGEX.test(trimmedCode)) {
      return NextResponse.json({ msg: "Invalid access code" }, { status: 400 });
    }

    const user = await UserModel.findOne({ accessCode: trimmedCode });
    if (!user) {
      return NextResponse.json({ msg: "Invalid access code" }, { status: 401 });
    }

    const subscription = await SubscriptionModel.findOne({
      userId: user._id,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        subscription: subscription?.serviceEnabled ?? false,
      },
    });
  } catch (error) {
    console.error("Access login error:", error);
    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}
