import { connectDB } from "@/lib/dbconnection/db";
import { NextResponse } from "next/server";
import CategoryModel from "@/model/category/category.model";
import { getUser } from "@/helper/auth/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const authUser = getUser(request);

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid access: Missing userId" },
        { status: 400 },
      );
    }

    if (authUser.id !== userId) {
      return NextResponse.json(
        { message: "Forbidden: You cannot access another user's data" },
        { status: 403 },
      );
    }

    // --- 1. EXTRACT AND VALIDATE LIMIT AND PAGE ---
    const searchParams = request.nextUrl.searchParams;

    // Parse the values, but use Math.max to ensure they never drop below 1
    // (e.g., if someone passes ?page=-5, it forces it to 1)
    let limit = parseInt(searchParams.get("limit") || "20", 10);
    let page = parseInt(searchParams.get("page") || "1", 10);

    if (isNaN(limit) || limit < 1) limit = 20;
    if (isNaN(page) || page < 1) page = 1;

    const skip = (page - 1) * limit;

    // --- 2. RUN QUERIES CONCURRENTLY ---
    // Promise.all runs both database calls at the same time for maximum speed
    const [categories, totalCategories] = await Promise.all([
      CategoryModel.find({ clientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() is perfect here!

      CategoryModel.countDocuments({ clientId: userId }), // Removed .lean() from here
    ]);

    // Send back the categories along with pagination metadata
    return NextResponse.json(
      {
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
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
