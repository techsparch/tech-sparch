import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      clientId,
      categoryId,
      docName,
      fileUrl,
      publicId,
      uploadedBy,
      format,
      bytes,
      originalFileName,
      fileName,
    } = body;

    const verifySession = await getServerSession(authOptions);

    if (!verifySession) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

    const document = await DocumentModel.create({
      clientId,
      categoryId,
      docName,
      fileUrl,
      publicId,
      uploadedBy,
      format,
      bytes,
      originalFileName,
      fileName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        data: document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("DOCUMENT_UPLOAD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save document",
      },
      { status: 500 },
    );
  }
}
