import { NextResponse } from "next/server";
import { getFundamentals, getHistorical } from "@/lib/api/unified";
import { pyIndicators } from "@/lib/api/py";
import { finnhubCompanyNews } from "@/lib/api/finnhub";
import { annualizedVol, maxDrawdown, sharpeRatio } from "@/lib/analysis/risk";
import { claudeAvailable, synthesizeVerdict } from "@/lib/api/claude";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!claudeAvailable()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY missing" },
      { status: 503 }
    );
  }

  const [fundamentals, historical, news] = await Promise.all([
    getFundamentals(ticker),
    getHistorical(ticker, "1y", "1d"),
    finnhubCompanyNews(ticker, 7),
  ]);

  if (!fundamentals) {
    return NextResponse.json({ error: "no data" }, { status: 404 });
  }

  let technicals: Record<string, unknown> = {};
  if (historical?.candles.length) {
    try {
      const ind = await pyIndicators(historical.candles);
      const last = ind.points[ind.points.length - 1];
      technicals = {
        rsi14: last?.rsi14 ?? null,
        macd: last?.macd ?? null,
        ema20: last?.ema20 ?? null,
        ema50: last?.ema50 ?? null,
        ema200: last?.ema200 ?? null,
        pattern: ind.snapshot.pattern,
      };
    } catch {
      // keep empty
    }
  }

  const risk = {
    annualizedVol: historical ? annualizedVol(historical.candles) : null,
    maxDrawdown: historical ? maxDrawdown(historical.candles) : null,
    sharpe: historical ? sharpeRatio(historical.candles) : null,
  };

  const verdict = await synthesizeVerdict({
    symbol: ticker,
    fundamentals: fundamentals as unknown as Record<string, unknown>,
    technicals,
    risk,
    newsHeadlines: news.slice(0, 10).map((n) => n.headline),
  });

  if (!verdict) {
    return NextResponse.json({ error: "claude failed" }, { status: 502 });
  }

  return NextResponse.json({ ...verdict, aiPowered: true });
}
