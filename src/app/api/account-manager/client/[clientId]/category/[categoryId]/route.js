import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

import UserModel from "@/model/user/user.model";
import DocumentModel from "@/model/doc/doc.model";
import CategoryModel from "@/model/category/category.model"

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { clientId, categoryId } =await params;

    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ca") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
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

    const client = await UserModel.findOne({
      _id: clientId,
      assignedCaId: session.user.id,
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found or access denied",
        },
        { status: 403 },
      );
    }

    const documents = await DocumentModel.find({
      clientId,
      categoryId,
    })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

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
