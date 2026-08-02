// app/api/tasks/[taskId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/dbconnection/db";
import TaskModel from "@/model/task/task.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

// 1. FIXED: Changed GET to PATCH for updating data
export async function PATCH(req, { params }) {
  try {
    // Auth check first — fail fast
    const verifySession = await getServerSession(authOptions);
    if (!verifySession || verifySession.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure DB connection
    await connectDB();

    const { taskId } = await params;

    // 2. FIXED: Passed taskId directly as the first argument
    // Added { new: true } to return the updated document if needed
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { status: "completed", completedAt: new Date() }, // Bonus: Set your schema's completedAt field
      { new: true, runValidators: true },
    );

    // 3. FIXED: Handle the case where the task doesn't exist
    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // 4. FIXED: Returned 200 instead of 201
    return NextResponse.json(
      { message: "Task marked as completed" },
      { status: 200 },
    );
  } catch (error) {
    // 5. FIXED: Updated log message
    console.error("Error updating task:", error);

    // Mongoose CastError happens if taskId is not a valid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid Task ID format" },
        { status: 400 },
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation Error", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
