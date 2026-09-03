import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/dbconnection/db";
import InvoiceModel from "@/model/payment/invoice.model";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import cloudinary from "@/lib/cloudinary/connection";
import { Readable } from "stream";
import { authOptions } from "../../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";

export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "system") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let userId = null;
    let reportType = "excel"; // Default

    // Fix: Only parse request.json() ONCE
    try {
      const body = await request.json();
      userId = body?.userId || null;
      // Handle both "type" or "reportType" being sent in the body
      if (body?.reportType) {
        reportType = body.reportType.toLowerCase();
      } else if (body?.type) {
        reportType = body.type.toLowerCase();
      }
    } catch {
      // no body sent — default to "all clients" and "pdf"
    }

    if (!["pdf", "excel", "xlsx"].includes(reportType)) {
      return NextResponse.json(
        {
          error: "Invalid report type requested. Please use 'pdf' or 'excel'.",
        },
        { status: 400 },
      );
    }

    const twentyFourMonthsAgo = new Date();
    twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

    const matchStage = { createdAt: { $gte: twentyFourMonthsAgo } };
    if (userId) matchStage.userId = userId;

    const groupedData = await InvoiceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          paymentCycles: {
            $push: {
              _id: "$_id",
              invoiceId: "$invoiceId",
              amount: "$amount",
              pdfUrl: "$pdfUrl",
              subscriptionId: "$subscriptionId",
              createdAt: "$createdAt",
              // --- NEW FIELDS ADDED HERE ---
              billingStart: "$billingStart",
              billingEnd: "$billingEnd",
              issuedAt: "$issuedAt"
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          paymentCycles: 1, // This now includes the new date fields
          name: "$userInfo.name",
          mobile: "$userInfo.mobile",
          shopName: "$userInfo.shopName",
          email: "$userInfo.email",
        },
      },
    ]);

    if (groupedData.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No invoices found for the given period.",
          data: [],
        },
        { status: 200 },
      );
    }

    const timestamp = Date.now();
    const baseName = userId
      ? `client-${userId}-${timestamp}`
      : `all-clients-${timestamp}`;

    let uploadedFile = null;
    let returnedFileType = "";

    if (reportType === "excel" || reportType === "xlsx") {
      const excelBuffer = await generateInvoiceExcelBuffer(groupedData);
      uploadedFile = await uploadBufferToCloudinary(excelBuffer, {
        folder: "reports/invoices/xlsx",
        publicId: baseName,
        format: "xlsx",
      });
      returnedFileType = "excel";
    } else if (reportType === "pdf") {
      const pdfBuffer = await generateInvoicePdfBuffer(groupedData);
      uploadedFile = await uploadBufferToCloudinary(pdfBuffer, {
        folder: "reports/invoices/pdf",
        publicId: baseName,
        format: "pdf",
      });
      returnedFileType = "pdf";
    }

    return NextResponse.json(
      {
        success: true,
        clientCount: groupedData.length,
        invoiceCount: groupedData.reduce(
          (n, c) => n + c.paymentCycles.length,
          0,
        ),
        fileType: returnedFileType,
        file: {
          secureUrl: uploadedFile.secureUrl,
          publicId: uploadedFile.publicId,
          bytes: uploadedFile.bytes,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Client payment report error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------------
// Helper Functions (Updated with email and mobile)
// ----------------------------------------------------------------------

export async function generateInvoiceExcelBuffer(groupedData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "System";
  workbook.created = new Date();

  // Sheet 1: All Payments
  const sheet = workbook.addWorksheet("All Payments", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Client ID", key: "userId", width: 26 },
    { header: "Client Name", key: "name", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Shop Name", key: "shopName", width: 22 },
    { header: "Mobile", key: "mobile", width: 18 }, 
    { header: "Invoice ID", key: "invoiceId", width: 22 },
    { header: "Subscription ID", key: "subscriptionId", width: 22 },
    { header: "Month", key: "month", width: 14 }, // Added Month Column
    { header: "Amount", key: "amount", width: 12 },
    { header: "Invoice PDF Link", key: "pdfUrl", width: 32 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  let rowCount = 0;
  for (const client of groupedData) {
    for (const pc of client.paymentCycles) {
      rowCount++;

    // Prioritize the actual billing month over the database insertion date
      const targetDate = pc.billingStart || pc.issuedAt || pc.createdAt;
      
      const monthStr = targetDate
        ? new Date(targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : "N/A";

      const row = sheet.addRow({
        userId: client._id?.toString() || "N/A",
        name: client.name || "N/A",
        email: client.email || "N/A", 
        shopName: client.shopName || "N/A",
        mobile: client.mobile || "N/A", 
        invoiceId: pc.invoiceId,
        subscriptionId: pc.subscriptionId,
        month: monthStr, // Added Month Data
        amount: pc.amount,
        pdfUrl: pc.pdfUrl,
      });
      
      row.getCell("amount").numFmt = "#,##0";
      
      const linkCell = row.getCell("pdfUrl");
      if (pc.pdfUrl) {
        linkCell.value = { text: pc.pdfUrl, hyperlink: pc.pdfUrl };
        linkCell.font = {
          name: "Arial",
          color: { argb: "FF0563C1" },
          underline: true,
        };
      }
      
      row.eachCell((cell) => {
        cell.font = cell.font || { name: "Arial", size: 10 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD9D9D9" } },
          bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
          left: { style: "thin", color: { argb: "FFD9D9D9" } },
          right: { style: "thin", color: { argb: "FFD9D9D9" } },
        };
      });
    }
  }

  // Adjust total formula for new column indexing (Amount is now column I)
  const totalRow = sheet.addRow({
    month: "Total",
    amount: { formula: `SUM(I2:I${rowCount + 1})` }, 
  });
  totalRow.font = { name: "Arial", bold: true, size: 10 };
  totalRow.getCell("amount").numFmt = "#,##0"; 

  // Sheet 2: Summary by Client
  const summary = workbook.addWorksheet("Summary by Client", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  
  summary.columns = [
    { header: "Client ID", key: "userId", width: 26 },
    { header: "Client Name", key: "name", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Shop Name", key: "shopName", width: 22 },
    { header: "Number of Invoices", key: "count", width: 20 },
    { header: "Total Amount", key: "total", width: 16 },
  ];
  
  summary.getRow(1).eachCell((cell) => {
    cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  let r = 2;
  for (const client of groupedData) {
    summary.addRow({
      userId: client._id?.toString() || "N/A",
      name: client.name || "N/A",
      email: client.email || "N/A",
      shopName: client.shopName || "N/A",
      count: { formula: `COUNTIF('All Payments'!A:A,A${r})` },
      total: { formula: `SUMIF('All Payments'!A:A,A${r},'All Payments'!I:I)` }, // I is Amount
    });
    summary.getCell(`F${r}`).numFmt = "#,##0"; 
    r++;
  }

  const grandTotalRow = summary.addRow({
    shopName: "Grand Total",
    count: { formula: `SUM(E2:E${r - 1})` },
    total: { formula: `SUM(F2:F${r - 1})` },
  });
  grandTotalRow.font = { name: "Arial", bold: true, size: 10 };
  grandTotalRow.getCell("total").numFmt = "#,##0";

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export function generateInvoicePdfBuffer(groupedData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let grandTotal = 0;
    let totalInvoices = 0;

    for (const client of groupedData) {
      totalInvoices += client.paymentCycles.length;
      for (const pc of client.paymentCycles) {
        grandTotal += pc.amount || 0;
      }
    }

    // ---- Document Header ----
    doc
      .fontSize(18)
      .fillColor("#1F4E78")
      .text("Client Payment Details Report", { align: "left" });
    doc
      .fontSize(9)
      .fillColor("#555555")
      .text(
        `Generated on ${new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}  |  Period: Last 24 months`,
      );
    doc.moveDown(1);

    // ---- Summary strip ----
    const summaryY = doc.y;
    const boxWidth = (doc.page.width - 80) / 3;
    const summaries = [
      ["Total Clients", String(groupedData.length)],
      ["Total Invoices", String(totalInvoices)],
      ["Total Amount", `${grandTotal.toLocaleString()}`],
    ];

    summaries.forEach(([label, value], i) => {
      const x = 40 + i * boxWidth;
      doc.rect(x, summaryY, boxWidth - 8, 44).fill("#EAF1F8");
      doc
        .fillColor("#1F4E78")
        .fontSize(9)
        .text(label, x + 8, summaryY + 6);
      doc
        .fillColor("#000000")
        .fontSize(14)
        .text(value, x + 8, summaryY + 20);
    });

    doc.y = summaryY + 54;
    doc.moveDown(2);

    doc.fontSize(12).fillColor("#1F4E78").text("Payment Lifecycles by Client");
    doc.moveDown(0.5);

    // Recalculated Column positions to fit the "Month" column
    const colX = [45, 190, 350, 440];
    const colW = [140, 150, 80, 95];
    const rowHeight = 18;
    const bottomMargin = doc.page.height - 50;

    const checkAndAddPage = (requiredHeight) => {
      if (doc.y + requiredHeight > bottomMargin) {
        doc.addPage();
      }
    };

    // ---- Loop Through Data ----
    for (const client of groupedData) {
      const clientTotal = client.paymentCycles.reduce(
        (sum, pc) => sum + (pc.amount || 0),
        0,
      );

      checkAndAddPage(36);
      let startY = doc.y;

      doc.rect(40, startY, doc.page.width - 80, 36).fill("#D9E2EC");

      // LEFT COLUMN
      doc.fillColor("#1F4E78").fontSize(10).font("Helvetica-Bold");
      doc.text(client.name || "Unknown Client", 50, startY + 7);
      doc.fillColor("#555555").fontSize(8.5).font("Helvetica");
      doc.text(client.email ? `Email: ${client.email}` : "Email: N/A", 50, startY + 21);

      // MIDDLE COLUMN
      doc.fillColor("#333333").fontSize(9).font("Helvetica-Bold");
      doc.text(client.shopName ? `Shop: ${client.shopName}` : "Shop: N/A", 240, startY + 7);
      doc.font("Helvetica");
      doc.text(client.mobile ? `Ph: ${client.mobile}` : "Ph: N/A", 240, startY + 21);

      // RIGHT COLUMN
      doc.fillColor("#1F4E78").fontSize(10).font("Helvetica-Bold");
      doc.text(`Total: ${clientTotal.toLocaleString()}`, colX[3], startY + 13, {
        width: colW[3],
        align: "right",
      });

      doc.y = startY + 36;

      // 2. Draw Table Header
      checkAndAddPage(18);
      startY = doc.y;

      doc.rect(40, startY, doc.page.width - 80, 18).fill("#1F4E78");
      doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold");

      doc.text("Invoice ID", colX[0], startY + 5, { width: colW[0] });
      doc.text("Subscription ID", colX[1], startY + 5, { width: colW[1] });
      doc.text("Month", colX[2], startY + 5, { width: colW[2] }); // New Header
      doc.text("Amount", colX[3], startY + 5, { width: colW[3], align: "right" });

      doc.y = startY + 18;
      doc.font("Helvetica");

      // 3. Draw Client Invoices
      client.paymentCycles.forEach((pc, i) => {
        checkAndAddPage(rowHeight);
        startY = doc.y;

        const bgColor = i % 2 === 0 ? "#F5F8FB" : "#FFFFFF";
        doc.rect(40, startY, doc.page.width - 80, rowHeight).fill(bgColor);

        // Format Date to Month Year (e.g. "Aug 2024")
       // Prioritize the actual billing month over the database insertion date
      const targetDate = pc.billingStart || pc.issuedAt || pc.createdAt;
      
      const monthStr = targetDate
        ? new Date(targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : "N/A";

        doc.fillColor("#000000").fontSize(8.5);
        doc.text(pc.invoiceId || "N/A", colX[0], startY + 4, { width: colW[0] });
        doc.text(pc.subscriptionId || "N/A", colX[1], startY + 4, { width: colW[1] });
        doc.text(monthStr, colX[2], startY + 4, { width: colW[2] }); // New Row Data
        doc.text(`${(pc.amount || 0).toLocaleString()}`, colX[3], startY + 4, {
          width: colW[3],
          align: "right",
        });

        doc.y = startY + rowHeight;
      });

      doc.y += 16;
    }

    doc.moveDown(2);
    checkAndAddPage(20);
    doc
      .fontSize(7.5)
      .fillColor("#888888")
      .text(
        "Note: Invoice PDF download links are omitted from this summary report for confidentiality. Refer to the accompanying spreadsheet for direct invoice links.",
        40,
        doc.y,
      );

    doc.end();
  });
}
// uploadBufferToCloudinary remains unchanged
export function uploadBufferToCloudinary(buffer, { folder, publicId, format }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        public_id: publicId,
        format,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        });
      },
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}
