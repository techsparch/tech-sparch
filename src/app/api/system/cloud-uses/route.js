// app/api/admin/media-usage/route.js

import cloudinary from "@/lib/cloudinary/connection";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/option";

export const dynamic = "force-dynamic";

function bytesToGB(bytes) {
  return Number((bytes / (1024 * 1024 * 1024)).toFixed(2));
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "system") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const usage = await cloudinary.api.usage();

  // Cloudinary Free Tier limits (Change these if you are on a Pro Plan)
  const PLAN_STORAGE_LIMIT_GB = 25; 
  const PLAN_BANDWIDTH_LIMIT_GB = 25;

  const storageUsedGB = bytesToGB(usage.storage?.usage || 0);
  const bandwidthUsedGB = bytesToGB(usage.bandwidth?.usage || 0);

  return NextResponse.json({
    // 1. Flat array formatted specifically for Shadcn <PieChart />
    storageChartData: [
      { name: "Used", amount: storageUsedGB, fill: "var(--color-used)" },
      { name: "Available", amount: Number((PLAN_STORAGE_LIMIT_GB - storageUsedGB).toFixed(2)), fill: "var(--color-available)" }
    ],
    // 2. Flat array formatted specifically for Shadcn <BarChart />
    bandwidthChartData: [
      { category: "Bandwidth", used: bandwidthUsedGB, limit: PLAN_BANDWIDTH_LIMIT_GB }
    ],
    rawTotals: {
      objects: usage.objects?.usage || 0,
      storage_credits: usage.storage?.credits || 0
    }
  });
}