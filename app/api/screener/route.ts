import { NextResponse } from "next/server";
import { buildScreenerSnapshot, applyFilters, type ScreenerFilters } from "@/lib/screener/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const filters = (await req.json()) as ScreenerFilters;
  const rows = await buildScreenerSnapshot();
  const filtered = applyFilters(rows, filters);
  return NextResponse.json({ rows: filtered, total: rows.length });
}

export async function GET() {
  const rows = await buildScreenerSnapshot();
  return NextResponse.json({ rows, total: rows.length });
}
