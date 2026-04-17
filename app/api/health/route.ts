import { NextResponse } from "next/server";
import { finnhubAvailable } from "@/lib/api/finnhub";
import { fmpAvailable } from "@/lib/api/fmp";
import { alphavantageAvailable } from "@/lib/api/alphavantage";
import { marketauxAvailable } from "@/lib/api/marketaux";
import { newsapiAvailable } from "@/lib/api/newsapi";
import { coingeckoAvailable } from "@/lib/api/coingecko";
import { fredAvailable } from "@/lib/api/fred";
import { binanceAvailable } from "@/lib/api/binance";

export async function GET() {
  const py = await fetch(`${process.env.PY_BACKEND_URL || "http://127.0.0.1:8001"}/health`, {
    cache: "no-store",
  })
    .then((r) => r.ok)
    .catch(() => false);

  return NextResponse.json({
    pythonBackend: py,
    providers: {
      finnhub: finnhubAvailable(),
      fmp: fmpAvailable(),
      alphavantage: alphavantageAvailable(),
      marketaux: marketauxAvailable(),
      newsapi: newsapiAvailable(),
      coingecko: coingeckoAvailable(),
      fred: fredAvailable(),
      binance: binanceAvailable(),
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    },
  });
}
