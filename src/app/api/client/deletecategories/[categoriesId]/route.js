import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import DocumentModel from "@/model/doc/doc.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
import CategoryModel from "@/model/category/category.model";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (
      !verifySession ||
      !verifySession.user ||
      verifySession.user.role !== "client"
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid session." },
        { status: 401 },
      );
    }

    const { categoriesId } = await params;

    if (!categoriesId) {
      return NextResponse.json(
        { success: false, message: "categoriesId is required" },
        { status: 400 },
      );
    }

    // 1. Check if the category exists
    const categoryExists = await CategoryModel.findById(categoriesId);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // 2. Count how many documents are inside this category
    // NOTE: Change "categoryId" to the exact field name you use in DocumentModel
    const documentCount = await DocumentModel.countDocuments({
      categoryId: categoriesId,
    });

    // 3. If there are documents, block the deletion
    if (documentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category. It still contains ${documentCount} document(s). Please delete or move them first.`,
        },
        { status: 409 }, // 409 Conflict is standard for this kind of state error
      );
    }

    // 4. If document count is 0, it's safe to delete the category
    await CategoryModel.findByIdAndDelete(categoriesId);

    return NextResponse.json(
      {
        success: true,
        message: "Empty category deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting category:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
