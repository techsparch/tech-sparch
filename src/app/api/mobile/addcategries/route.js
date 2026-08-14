import { getUser } from "@/helper/auth/auth";
import { connectDB } from "@/lib/dbconnection/db";
import CategoryModel from "@/model/category/category.model";
import SubscriptionModel from "@/model/payment/subscription.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const authUser = getUser(request);

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }


    // 1. Correctly parse the JSON body
    const { categoriesName } = await request.json();

    // 2. Validate input and return a 400 status if missing
    if (!categoriesName) {
      return NextResponse.json(
        { message: "Category name  required." },
        { status: 400 },
      );
    }

    const checkUserSubscribe = await SubscriptionModel.findOne({
      userId: authUser.id,
    });

    // Define allowed statuses
    const allowedStatuses = ["active", "gracePeriod"];

    if (
      !checkUserSubscribe ||
      !allowedStatuses.includes(checkUserSubscribe.status)
    ) {
      return NextResponse.json(
        {
          message:
            "Action denied. An active subscription is required to create new categories.",
        },
        { status: 403 },
      );
    }

    const exists = await CategoryModel.findOne({
      categoryName: categoriesName.trim(),
    });

    if (exists) {
      return NextResponse.json(
        { message: "Category already exists." },
        { status: 409 },
      );
    }

    const newCategory = await CategoryModel.create({
      categoryName: categoriesName,
      clientId: authUser.id,
      createdBy: authUser.id,
    });

    // 4. Return a success response with a 201 status
    return NextResponse.json(
      { message: "Category created successfully", category: newCategory },
      { status: 201 },
    );
  } catch (error) {
    // 5. Catch the error so the server doesn't crash or hang
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the category." },
      { status: 500 },
    );
  }
}
