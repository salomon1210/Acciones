import { NextResponse } from "next/server";
import { getUnifiedNews } from "@/lib/api/news-unified";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tickers = url.searchParams.get("tickers");
  const category = url.searchParams.get("category") as "general" | "crypto" | null;
  const items = await getUnifiedNews({
    tickers: tickers ? tickers.split(",").filter(Boolean) : undefined,
    category: category ?? undefined,
  });
  return NextResponse.json({ items });
}
