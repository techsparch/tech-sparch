import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { NextResponse } from "next/server";
import CategoryModel from "@/model/category/category.model";
import UserModel from "@/model/user/user.model";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();



    const { userId } = await params;

    console.log(userId)
    if (!userId) return NextResponse.json("invalid assess");

    const findUser = await UserModel.findById(userId);

    if (!findUser) return NextResponse.json("user Not exist ");

    const categories = await DocumentModel.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(userId),
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

    if (!categories) return NextResponse.json("no categories found on volute");

    return NextResponse.json(categories);
  } catch (error) {
    console.log(error);
  }
}
