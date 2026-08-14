import { getUser } from "@/helper/auth/auth";
import cloudinary from "@/lib/cloudinary/connection";
import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const authUser = getUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { DocsId } = await params;

    if (!DocsId) {
      return NextResponse.json(
        { message: "DocsId is required" },
        { status: 400 },
      );
    }

    // 1. Find Document
    const Docs = await DocumentModel.findById(DocsId);
    if (!Docs) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 },
      );
    }

    // 2. Delete from Cloudinary
    // Prefer using a stored resource_type on the doc, e.g. Docs.resourceType
    const result = await cloudinary.uploader.destroy(Docs.publicId, {
      resource_type: Docs.resourceType || "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { message: "Failed to delete file from storage" },
        { status: 502 },
      );
    }

    // 3. Delete from DB
    const deleteDocsFromDb = await DocumentModel.deleteOne({
      _id: Docs._id,
    });

    if (deleteDocsFromDb.deletedCount === 0) {
      return NextResponse.json(
        { message: "Unable to delete document record" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Document and associated file deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Document API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
