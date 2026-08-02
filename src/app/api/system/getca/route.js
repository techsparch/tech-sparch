import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(request) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Invalid or expired session.",
        },
        { status: 401 },
      );
    }

    // 2. Parse pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 30;
    const skip = (page - 1) * limit;

    // 3. Connect to database
    await connectDB();

    // 4. Run aggregation pipeline & total count in parallel
    const [totalUsers, caUsers] = await Promise.all([
      UserModel.countDocuments({ role: "ca" }),
      UserModel.aggregate([
        // Step A: Filter for CAs only
        { $match: { role: "ca" } },

        // Step B: Apply pagination
        { $skip: skip },
        { $limit: limit },

        // Step C: Lookup clients where assignedCaId matches the CA's _id
        {
          $lookup: {
            from: "users", // The MongoDB collection name for UserModel
            let: { caId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$role", "client"] },
                      { $eq: ["$assignedCaId", "$$caId"] },
                    ],
                  },
                },
              },
            ],
            as: "assignedClients",
          },
        },

        // Step D: Calculate client count & select specific fields
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            totalClientsAdded: { $size: "$assignedClients" },
          },
        },
      ]),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json(
      {
        success: true,
        data: caUsers,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching CA users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
