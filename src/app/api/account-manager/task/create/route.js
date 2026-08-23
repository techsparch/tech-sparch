import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/dbconnection/db";
import TaskModel from "@/model/task/task.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(req) {
  try {
    // 1. Auth check first — fail fast before touching DB or body
    const verifySession = await getServerSession(authOptions);
    if (!verifySession || verifySession.user.role !== "ca") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Ensure DB connection
    await connectDB();

    // 3. Parse the incoming JSON body
    const body = await req.json();

    // 4. Extract and validate required fields
    const { title, description } = body;
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title is mandatory." },
        { status: 400 },
      );
    }

    const taskOption = {
      title,
      description,
      status: "open", 
      assignedCaId: verifySession.user.id,
      createdBy: verifySession.user.id,
    };

    const newTask = await TaskModel.create(taskOption);

    return NextResponse.json(
      { message: "Task created successfully", task: newTask },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating task:", error);

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
