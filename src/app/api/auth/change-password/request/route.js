import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import { sendMail } from "@/lib/resend/email";

export async function POST(req) {
  try {
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json(
        { message: "Mobile number is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await UserModel.findOne({ mobile });

    if (!user) {
      // If user does not exist, immediately stop and send 401
      return NextResponse.json(
        {
          message:
            "We couldn't find an account with that mobile number. Please check and try again.",
        },
        { status: 401 },
      );
    }
    if (!user.email) {
      return NextResponse.json(
        {
          message:
            "It looks like there isn't an email address linked to this account, so we can't send a reset code. Please contact support for help.",
        },
        { status: 400 },
      );
    }

    const MAX_LIMIT = 3;
    const WINDOW_MS = 24 * 60 * 60 * 1000;
    const now = new Date();

    let count = user.resetPasswordCount || 0;
    let windowStart = user.resetPasswordWindowStart
      ? new Date(user.resetPasswordWindowStart)
      : null;

    if (windowStart && now - windowStart < WINDOW_MS) {
      if (count >= MAX_LIMIT) {
        return NextResponse.json(
          { message: "Limit of 3 requests reached for today." },
          { status: 429 },
        );
      }
      count += 1;
    } else {
      windowStart = now;
      count = 1;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    user.resetOtpAttempts = 0; // Reset attempts to 0 for the new OTP
    user.resetPasswordCount = count;
    user.resetPasswordWindowStart = windowStart;

    await user.save();

    const emailResult = await sendMail({
      to: user.email,
      subject: "Your Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send email." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: `OTP sent to your email. (${count}/3 requests used today)` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
