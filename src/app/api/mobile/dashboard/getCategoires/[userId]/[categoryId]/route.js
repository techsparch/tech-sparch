import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DocumentModel from "@/model/doc/doc.model";
import { connectDB } from "@/lib/dbconnection/db";
import CategoryModel from "@/model/category/category.model";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { userId, categoryId } = await params;

    console.log(userId , categoryId)

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Client or Category ID",
        },
        { status: 400 },
      );
    }

    const documents = await DocumentModel.find({
    clientId: userId,
      categoryId,
    })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: documents.length,
        data: documents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 },
    );
  }
}
