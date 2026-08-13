import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/dbconnection/db";
import InvoiceModel from "@/model/payment/invoice.model";
import { authOptions } from "../auth/[...nextauth]/option";

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id;

    // 2. Extract pagination parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 3. Run the query and the count concurrently
    const [invoices, totalInvoices] = await Promise.all([
      InvoiceModel.find({ userId })
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InvoiceModel.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(totalInvoices / limit);

    return NextResponse.json(
      {
        success: true,
        invoices,
        pagination: {
          total: totalInvoices,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}
