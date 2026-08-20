import { connectDB } from "@/lib/dbconnection/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import UserModel from "@/model/user/user.model";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { clientId, reqId } = body;

    // 1. Basic input validation
    if (!clientId || !reqId) {
      return NextResponse.json(
        { message: "Client ID and Registration ID are required", success: false },
        { status: 400 },
      );
    }

    // 2. Verify session and role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user?.role !== "ca") {
      return NextResponse.json(
        { message: "Not authenticated or unauthorized", success: false },
        { status: 401 }, 
      );
    }

    // 3. Find user (Must explicitly select accessCode because it is select: false in schema)
    const user = await UserModel.findById(clientId)

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 } // 404 is proper for missing resources
      );
    }

    // 4. Validate Registration ID
    if (user.newRegId !== reqId) {
      return NextResponse.json(
        { message: "Registration ID is incorrect. Please check and try again.", success: false },
        { status: 400 }
      );
    }

    // Optional Check: Prevent stealing clients if they already have a CA assigned
    // if (user.assignedCaId && user.assignedCaId.toString() !== session.user.id) {
    //   return NextResponse.json(
    //     { message: "This client is already assigned to another CA.", success: false },
    //     { status: 403 }
    //   );
    // }

    // 5. Update the user (using .save() instead of hitting the DB again with findByIdAndUpdate)
    user.assignedCaId = session.user.id;
    await user.save();

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        message: "Client successfully assigned.",
        accessCode: user.accessCode // This now works because of .select("+accessCode")
      },
      { status: 200 }
    );

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

