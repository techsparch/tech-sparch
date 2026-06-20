import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const folder = body.folder || "sp-consultancy";

    console.log(folder);

    const timestamp = Math.floor(Date.now() / 1000);

    // IMPORTANT: FIXED ORDER (folder first)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    return NextResponse.json({ message: "signature error" }, { status: 500 });
  }
}
