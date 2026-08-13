import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/option";
import SubscriptionModel from "@/model/payment/subscription.model";
import cloudinary from "@/lib/cloudinary/connection";

export async function POST(req) {
  try {
    const verifySession = await getServerSession(authOptions);

    if (!verifySession || !verifySession.user) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

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

    if (!fileUrl || !docName || !publicId) {
      return NextResponse.json(
        { message: "Bad Request. Missing required file data." },
        { status: 400 },
      );
    }

    const checkUserSubscribe = await SubscriptionModel.findOne({
      userId: clientId,
    }).lean();

    const allowedStatuses = ["active", "gracePeriod"];

    // ==========================================
    // CLEANUP ORPHANED FILE ON SUBSCRIPTION FAIL
    // ==========================================
    if (
      !checkUserSubscribe ||
      !allowedStatuses.includes(checkUserSubscribe.status)
    ) {
      if (publicId) {
        try {
          await cloudinary.api.delete_resources([publicId], {
            type: "upload",
            resource_type:
              format === "pdf" || format === "docx" ? "raw" : "image",
          });
          console.log(`Successfully cleaned up orphaned file: ${publicId}`);
        } catch (cleanupError) {
          console.error(
            `Failed to delete orphaned file ${publicId}:`,
            cleanupError,
          );
        }
      }

      return NextResponse.json(
        {
          message:
            "Action denied. User has not done a subscription to upload files.",
        },
        { status: 403 },
      );
    }

    // Save to Database
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

    // Optional: Clean up the file here too if the Database save fails!
    if (req.body?.publicId) {
      try {
        await cloudinary.api.delete_resources([req.body.publicId], {
          type: "upload",
        });
      } catch (e) {
        console.error("Failed to delete orphaned file after DB crash:", e);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save document",
      },
      { status: 500 },
    );
  }
}
