import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import { signAccessToken, verifyRefresh } from "@/helper/jwt/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    console.log("refreshing token")

    // 1. Extract from the Authorization header instead of the body
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Refresh token required in header" },
        { status: 401 }
      );
    }

    // 2. Split the token
    const refreshToken = authHeader.split(" ")[1];

    const decoded = verifyRefresh(refreshToken);
    const user = await UserModel.findById(decoded.id, "_id role").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const accessToken = signAccessToken(user);
    return NextResponse.json({ accessToken }, { status: 200 });

  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 401 }
    );
  }
}