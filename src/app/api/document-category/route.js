import { NextResponse } from "next/server";
import CategoryModel from "@/model/category/category.model";
import { connectDB } from "@/lib/dbconnection/db";
// import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    let { categoryName, docNames, createdBy } = body;

    if (!categoryName) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    categoryName = categoryName.trim();

    // ⚠️ IMPORTANT: normalize docNames
    if (!Array.isArray(docNames)) {
      docNames = [];
    }

    // check duplicate (multi-tenant safe)
    const exists = await CategoryModel.findOne({
      categoryName,
      createdBy,
    });

    if (exists) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await CategoryModel.create({
      categoryName,
      docNames,
      createdBy,
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}