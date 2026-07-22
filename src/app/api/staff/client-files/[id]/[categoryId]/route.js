import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/option";

import UserModel from "@/model/user/user.model";
import DocumentModel from "@/model/doc/doc.model";
import CategoryModel from "@/model/category/category.model";
import { connectDB } from "@/lib/dbconnection/db";

export async function GET(request, { params }) {
  try {
    await connectDB();


    const { id: clientId, categoryId } = await params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "staff") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const managerId = await UserModel.findById(session.user.id)
      .select("+assignedCaId")
      .lean();

    console.log(managerId.assignedCaId);

    if (!managerId || !managerId.assignedCaId) {
      return NextResponse.json(
        { message: "Staff assignment not found" },
        { status: 404 },
      );
    }
    const client = await UserModel.findOne({
      _id: clientId,
      assignedCaId: managerId.assignedCaId,
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found or access denied",
        },
        { status: 403 },
      );
    }

    const documents = await DocumentModel.find({
      clientId,
      categoryId,
    })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: documents.length,
        data: documents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
      },
      { status: 500 },
    );
  }
}
