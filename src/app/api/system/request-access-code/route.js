import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import UserModel from "@/model/user/user.model";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { message: "Client ID is required", success: false },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    // 2. Verify session and role
    if (!session || !session.user?.id || session.user?.role !== "system") {
      return NextResponse.json(
        { message: "Not authenticated or unauthorized", success: false },
        { status: 401 },
      );
    }

    // 3. Single, optimized database query
    const user = await UserModel.findById(clientId)
      .select("accessCode isActive")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        {
          message: "Account De-Activated ",
          deActivationStatus: 100,
          categories: [],
        },
        { status: 200 }, // 403 Forbidden is usually better for deactivated accounts
      );
    }

    return NextResponse.json({
      success: true,
      accessCode: user.accessCode,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
        success: false,
      },
      { status: 500 },
    );
  }
}
