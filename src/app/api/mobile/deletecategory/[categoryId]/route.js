import cloudinary from "@/lib/cloudinary/connection";
import { connectDB } from "@/lib/dbconnection/db";
import CategoryModel from "@/model/category/category.model";
import DocumentModel from "@/model/doc/doc.model";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const authUser = getUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { categoryId } = await params;

    // 1. Find Category
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    // 2. Find associated Documents
    const documents = await DocumentModel.find({ categoryId: category._id });

    // 3. Extract publicId using camelCase matching your schema
    if (documents.length > 0) {
      const publicIds = documents
        .map((doc) => doc.publicId) // <-- Matches your schema (publicId)
        .filter(Boolean);

      if (publicIds.length > 0) {
        // Delete across resource types (e.g. PDFs, images)
        const resourceTypes = ["image", "raw", "video"];
        await Promise.allSettled(
          resourceTypes.map((type) =>
            cloudinary.api.delete_resources(publicIds, {
              resource_type: type,
              type: "upload",
            }),
          ),
        );
      }

      // Delete document records from MongoDB
      await DocumentModel.deleteMany({ categoryId: category._id });
    }

    // 4. Delete Category
    await CategoryModel.findByIdAndDelete(categoryId);

    return NextResponse.json(
      { message: "Category and associated files deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Category API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
