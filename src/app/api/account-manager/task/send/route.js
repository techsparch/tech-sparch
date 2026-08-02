// app/api/tasks/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { connectDB } from "@/lib/dbconnection/db";
import TaskModel from "@/model/task/task.model";
import UserModel from "@/model/user/user.model";

export async function GET(req) {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Verify Session & Role
    const verifySession = await getServerSession(authOptions);
    if (!verifySession || verifySession.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch Staff User
    const checkStaffExist = await UserModel.findById(
      verifySession.user.id,
    ).lean();
    if (!checkStaffExist) {
      return NextResponse.json(
        { message: "Staff user not found" },
        { status: 404 },
      );
    }

    const { assignedCaId } = checkStaffExist;

    // --- NEW: PAGINATION LOGIC ---

    // Extract search params from the request URL
    const { searchParams } = new URL(req.url);

    // Parse page and limit (default to page 1, 10 items per page)
    const page = parseInt(searchParams.get("page")) || 1;
    const requestedLimit = parseInt(searchParams.get("limit")) || 30;
    const limit = Math.min(requestedLimit, 30);
    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Run both queries concurrently for better performance
    const [tasks, totalTasks] = await Promise.all([
      TaskModel.find({ assignedCaId })
        .sort({ createdAt: -1 }) // Show newest tasks first
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskModel.countDocuments({ assignedCaId }), // Get total count for pagination UI
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalTasks / limit);

    // Return the response with tasks and pagination metadata
    return NextResponse.json(
      {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          limit,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET /api/tasks:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
