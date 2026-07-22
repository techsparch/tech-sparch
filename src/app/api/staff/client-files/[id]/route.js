import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import DocumentModel from "@/model/doc/doc.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import CategoryModel from "@/model/category/category.model";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const verifySession = await getServerSession(authOptions);

    if (!verifySession || verifySession.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id:clientId } = await params;
    const staffId = verifySession.user.id;

    // Get staff and assigned CA
    const staff = await UserModel.findById(staffId)
      .select("+assignedCaId")
      .lean();

    if (!staff || !staff.assignedCaId) {
      return NextResponse.json(
        { message: "Staff assignment not found" },
        { status: 404 },
      );
    }

    // Verify client belongs to same CA
    const client = await UserModel.findOne({
      _id: clientId,
      role: "client",
      assignedCaId: staff.assignedCaId,
    }).lean();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found or access denied",
        },
        { status: 404 },
      );
    }

    const documents = await CategoryModel.find({
      clientId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        clientName: client.name,
        data: documents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
