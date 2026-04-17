import { NextResponse } from "next/server";
import { getPortfolioSummary } from "@/lib/portfolio/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getPortfolioSummary();
  return NextResponse.json(summary);
}
