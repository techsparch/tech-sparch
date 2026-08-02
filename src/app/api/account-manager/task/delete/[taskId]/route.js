// app/api/tasks/[taskId]/route.js (or your dynamic route path)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/dbconnection/db";
import TaskModel from "@/model/task/task.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function DELETE(req, { params }) {
  try {
    // 1. Auth check — fail fast
    const verifySession = await getServerSession(authOptions);
    
    // Assuming only a 'ca' (or admin) has permission to delete tasks
    if (!verifySession || verifySession.user.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Ensure DB connection
    await connectDB();

    // 3. Extract the taskId from params (await is required in Next.js 15)
    const { taskId } = await params;

    // 4. Perform the deletion (Hard Delete)
    const deletedTask = await TaskModel.findByIdAndDelete(taskId);

    // 5. Handle the case where the task didn't exist in the database
    if (!deletedTask) {
      return NextResponse.json(
        { message: "Task not found or already deleted" },
        { status: 404 }
      );
    }

    // 6. Return success
    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting task:", error);

    // Mongoose CastError happens if taskId is not a valid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid Task ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}