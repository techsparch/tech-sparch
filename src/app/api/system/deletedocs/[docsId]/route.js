import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import cloudinary from "@/lib/cloudinary/connection";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (
      !verifySession ||
      !verifySession.user ||
      verifySession.user.role !== "system"
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

    const { docsId } = await params;

    if (!docsId) {
      return NextResponse.json(
        { success: false, message: "Document ID is required" },
        { status: 400 },
      );
    }

    // 1. Find document in database
    const doc = await DocumentModel.findById(docsId);

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 },
      );
    }

    const { publicId, format } = doc;

    // 2. Delete asset from Cloudinary
    if (publicId) {
      try {
        const isRaw = format === "pdf" || format === "docx";

        await cloudinary.uploader.destroy(publicId, {
          resource_type: isRaw ? "raw" : "image",
        });

      } catch (cleanupError) {
        console.error(
          `Failed to delete Cloudinary file ${publicId}:`,
          cleanupError,
        );
      }
    }

    // 3. Remove document record from MongoDB
    await DocumentModel.findByIdAndDelete(docsId);

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Document deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting document:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
