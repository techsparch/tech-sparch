// app/api/dashboard/payments/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import UserModel from "@/model/user/user.model";
import InvoiceModel from "@/model/payment/invoice.model";
import { authOptions } from "../../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/dbconnection/db";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "system") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1. Pagination setup
    const { searchParams } = new URL(req.url);
    const requestedPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage);
    const limit = 30; // users per page
    const skip = (page - 1) * limit;

    // 2. Date calculation: exactly 5 months ago
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    // 3. The Aggregation Pipeline
    const dashboardData = await InvoiceModel.aggregate([
      {
        $match: {
          status: "paid",
          issuedAt: { $gte: fiveMonthsAgo },
        },
      },
      // Sort invoices within each user's array, most recent first
      { $sort: { issuedAt: -1 } },

      // Group invoices by userId
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
          invoiceCount: { $sum: 1 },
          invoices: {
            $push: {
              invoiceId: "$invoiceId",
              amount: "$amount",
              currency: "$currency",
              status: "$status",
              billingStart: "$billingStart",
              billingEnd: "$billingEnd",
              issuedAt: "$issuedAt",
              pdfUrl :"$pdfUrl"
            },
          },
        },
      },

      // Sort users by their most recent invoice (optional, keeps consistent order)
      { $sort: { "invoices.0.issuedAt": -1 } },

      // Paginate by user + attach client info
      {
        $facet: {
          metadata: [{ $count: "totalDocuments" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "clientInfo",
              },
            },
            {
              $unwind: {
                path: "$clientInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: "$_id",
                totalAmount: 1,
                invoiceCount: 1,
                invoices: 1,
                "clientInfo._id": 1,
                "clientInfo.name": 1,
                "clientInfo.email": 1,
              },
            },
          ],
        },
      },
    ]);

    // 4. Extract the $facet results safely
    const result = dashboardData[0];
    const totalDocuments = result?.metadata[0]?.totalDocuments || 0;
    const totalPages = Math.ceil(totalDocuments / limit);

    return NextResponse.json({
      success: true,
      pagination: {
        totalDocuments, // total distinct users
        totalPages,
        currentPage: page,
        limit,
      },
      data: result?.data || [],
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}