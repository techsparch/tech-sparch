import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import CategoryModel from "@/model/category/category.model";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // 1. You extracted the parameter as 'id'
    const { id } = await params;

    const searchParams = request.nextUrl.searchParams;

    let limit = parseInt(searchParams.get("limit") || "20", 10);
    let page = parseInt(searchParams.get("page") || "1", 10);

    if (isNaN(limit) || limit < 1) limit = 20;
    if (isNaN(page) || page < 1) page = 1;

    const skip = (page - 1) * limit;

    const [categories, totalCategories] = await Promise.all([
      // 2. FIXED: You were using 'userId' here, but it wasn't defined.
      // Changed it to use the 'id' you extracted from params above.
      CategoryModel.find({ clientId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      CategoryModel.countDocuments({ clientId: id }),
    ]);

    // 3. Combined your two return statements into one
    return NextResponse.json(
      {
        success: true,
        categories,
        pagination: {
          total: totalCategories,
          currentPage: page,
          totalPages: Math.ceil(totalCategories / limit),
          limit: limit,
        },
      },
      { status: 200 },
    );
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

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    const { categoryName } = body;
    const { id: clientId } = await params;

    // 3. Security: Derive `createdBy` from the verified session, NOT the client payload
    const createdBy = session.user.id || session.user.email;

    // 4. Validate input
    if (!clientId || !categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { message: "Client ID and Category Name are required." },
        { status: 400 },
      );
    }

    const trimmedCategoryName = categoryName.trim();

    // 5. Connect to DB only after validation passes
    await connectDB();

    // 6. Check for existing category (Case-insensitive is recommended to prevent "Books" and "books")
    const existingCategory = await CategoryModel.findOne({
      clientId,
      categoryName: { $regex: new RegExp(`^${trimmedCategoryName}$`, "i") },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists." },
        { status: 409 },
      );
    }

    // 7. Create category
    const createCategory = await CategoryModel.create({
      clientId,
      categoryName: trimmedCategoryName,
      createdBy,
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category: createCategory,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
