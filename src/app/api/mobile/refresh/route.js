import { signAccessToken, verifyRefresh } from "@/helper/jwt/jwt";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { msg: "refresh token required" },
        { status: 401 }
      );
    }

    const decoded = verifyRefresh(refreshToken);

    const newAccessToken = signAccessToken({ _id: decoded.id });

    return NextResponse.json({
      accessToken: newAccessToken,
    });

  } catch (err) {
    return NextResponse.json(
      { msg: "invalid refresh token" },
      { status: 401 }
    );
  }
}