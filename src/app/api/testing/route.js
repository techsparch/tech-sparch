import { connectDB } from "@/lib/dbconnection/db";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB Connected",
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}