// app/api/profile/route.js

import { getUser } from "@/helper/auth/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const user = getUser(request);

  if (!user) {
    return NextResponse.json(
      { msg: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    msg: "Authenticated",
    user,
  });
}