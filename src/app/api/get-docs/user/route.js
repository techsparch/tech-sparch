import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET() {
  try {
    await connectDB();

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

    const categories = await DocumentModel.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(session.user.id),
        },
      },
      {
        $lookup: {
          from: "documentcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category._id",
          categoryName: {
            $first: "$category.categoryName",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          categoryName: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        categories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_DOCUMENTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 },
    );
  }
}
