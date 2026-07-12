import { getUser } from "@/helper/auth/auth";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const currentUser = getUser(request);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const user = await UserModel.findById(currentUser.id)
      .select("-password")
      .populate("assignedCaId", "name")
      .lean();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    console.log("put api working...")

    const currentUser = getUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const {
      photoUri,
      shopName,
      businessType,
      gstNumber,
      panNumber,
      address,
      altMobile,
      bio,
    } = await request.json();

    const update = {};
    if (photoUri !== undefined) update.imageUrl = photoUri;
    if (shopName !== undefined) update.shopName = shopName;
    if (businessType !== undefined) update.businessType = businessType;
    if (gstNumber !== undefined) update.gstNumber = gstNumber;
    if (panNumber !== undefined) update.panNumber = panNumber;
    if (address !== undefined) update.address = address;
    if (altMobile !== undefined) update.altMobile = altMobile;
    if (bio !== undefined) update.bio = bio;

    const findUser = await UserModel.findByIdAndUpdate(currentUser.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("assignedCaId", "name")
      .lean();

    if (!findUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: findUser });
  } catch (error) {
    console.log(error);

    if (error.name === "ValidationError") {
      const errors = Object.fromEntries(
        Object.entries(error.errors).map(([field, e]) => [field, e.message]),
      );
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: error.status || 500 },
    );
  }
}