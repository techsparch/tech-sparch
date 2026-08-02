// app/api/tasks/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option"; // Check if this should be 'options'
import { connectDB } from "@/lib/dbconnection/db";
import TaskModel from "@/model/task/task.model";

export async function GET(req) {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Verify Session & Role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const assignedCaId = session.user.id;

    // Extract search params from the request URL
    const { searchParams } = new URL(req.url);

    // 3. Parse and strictly validate page/limit to prevent negative query errors
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const requestedLimit = Math.max(1, parseInt(searchParams.get("limit")) || 30);
    const limit = Math.min(requestedLimit, 30); // Cap at max 30 items
    
    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 4. Run both queries concurrently for better performance
    const [tasks, totalTasks] = await Promise.all([
      TaskModel.find({ assignedCaId })
        .sort({ createdAt: -1 }) // Show newest tasks first
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskModel.countDocuments({ assignedCaId }),
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/tasks:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}