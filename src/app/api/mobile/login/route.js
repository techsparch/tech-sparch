import { signAccessToken, signRefreshToken } from "@/helper/jwt/jwt";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();

  const { mobile, password } = await request.json();

  const user = await UserModel.findOne({ mobile }).select("+password");
  if (!user) {
    return NextResponse.json({ msg: "user not found" }, { status: 404 });
  }

  if (user.role !== "client")
    return NextResponse.json({ msg: "Only client login " });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ msg: "invalid credentials" }, { status: 401 });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
    },
  });
}
