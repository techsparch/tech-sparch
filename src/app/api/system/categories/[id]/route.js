import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const categories = await DocumentModel.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "documentcategories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          categoryName: "$category.categoryName",
          count: 1,
        },
      },
    ]);


    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
