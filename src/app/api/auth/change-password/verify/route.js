import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";

export async function POST(req) {
  try {
    const body = await req.json();
    const { mobile, otp, newPassword } = body;

    // 1. Basic validation
    if (!mobile || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Mobile, OTP, and new password are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    await connectDB();

    // 2. Find the user
    const user = await UserModel.findOne({ mobile });

    if (!user) {
      return NextResponse.json({ message: "User not exist" }, { status: 401 });
    }

    // 3. Check if an OTP was actually requested
    if (!user.resetOtp) {
      return NextResponse.json(
        {
          message:
            "No active password reset request found. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    // 4. Check max guess limit (Brute-force protection)
    if (user.resetOtpAttempts >= 5) {
      // Destroy the OTP fields
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      return NextResponse.json(
        {
          message:
            "Too many incorrect guesses. Your verification code has been canceled. Please request a new one.",
        },
        { status: 403 },
      );
    }

    // 5. Verify the OTP
    if (user.resetOtp !== otp) {
      // Increment the failed attempts counter
      user.resetOtpAttempts += 1;
      await user.save();

      const attemptsLeft = 5 - user.resetOtpAttempts;
      return NextResponse.json(
        {
          message: `Invalid verification code. You have ${attemptsLeft} attempts left.`,
        },
        { status: 400 },
      );
    }

    // 6. Check if OTP is expired
    if (new Date() > user.resetOtpExpiry) {
      return NextResponse.json(
        { message: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // 7. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 8. Update the user document
    user.password = hashedPassword;

    // Clear all the reset fields
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.resetOtpAttempts = 0;

    // Ensure they aren't forced to change it again on next login
    user.mustChangePassword = false;

    await user.save();

    // 9. Success response
    return NextResponse.json(
      { message: "Password reset successfully! You can now log in." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot Password Verify Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
