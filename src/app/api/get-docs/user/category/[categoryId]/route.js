import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";

import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req, context) {
  try {
    await connectDB();

    const { categoryId } = await context.params;

      console.log("categoryId:", categoryId);

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    
    const documents = await DocumentModel.find({
      clientId: session.user.id,
      categoryId,
    })
      .select("_id originalFileName fileUrl format bytes publicId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        documents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_CATEGORY_DOCUMENTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 },
    );
  }
}
