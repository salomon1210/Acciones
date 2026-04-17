import { NextResponse } from "next/server";
import { getPortfolioSummary, savePortfolioSnapshot } from "@/lib/portfolio/service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  const summary = await getPortfolioSummary();
  await savePortfolioSnapshot(summary);
  return NextResponse.json({ saved: true, totalValue: summary.totalValue });
}

export async function GET() {
  const snapshots = await prisma.portfolioSnapshot.findMany({
    orderBy: { takenAt: "asc" },
    take: 365,
  });
  return NextResponse.json({ snapshots });
}
