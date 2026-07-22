import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { connectDB } from "@/lib/dbconnection/db";
import CategoryModel from "@/model/category/category.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    const createdBy = session.user.id || session.user.email || "N/A";

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
