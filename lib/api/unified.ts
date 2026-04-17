// Unified data layer: tries premium providers first, falls back to yfinance (free).
// Every consumer should go through this module to keep fallback logic consistent.

import { cached, TTL } from "@/lib/utils/cache";
import { finnhubQuote } from "@/lib/api/finnhub";
import { pyQuote, pyHistorical, pyFundamentals, pyStatements, type PyCandle } from "@/lib/api/py";
import { avOverview } from "@/lib/api/alphavantage";
import { fmpCompanyProfile } from "@/lib/api/fmp";
import { resolveSymbol } from "@/lib/api/resolver";

export type UnifiedQuote = {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  currency: string;
  marketCap?: number | null;
  source: "finnhub" | "yfinance" | "none";
};

export async function getQuote(symbolRaw: string): Promise<UnifiedQuote | null> {
  const { symbol } = resolveSymbol(symbolRaw);
  return cached(`u:quote:${symbol}`, TTL.quote, async () => {
    // 1) Finnhub (equities only)
    try {
      const fh = await finnhubQuote(symbol);
      if (fh && fh.price > 0) {
        return {
          symbol,
          price: fh.price,
          prevClose: fh.prevClose,
          change: fh.change,
          changePct: fh.changePct,
          dayHigh: fh.dayHigh,
          dayLow: fh.dayLow,
          volume: null,
          currency: "USD",
          marketCap: null,
          source: "finnhub" as const,
        };
      }
    } catch {
      // continue
    }
    // 2) yfinance via FastAPI
    try {
      const y = await pyQuote(symbol);
      if (y && y.price > 0) {
        return {
          symbol,
          price: y.price,
          prevClose: y.prevClose,
          change: y.change,
          changePct: y.changePct,
          dayHigh: y.dayHigh,
          dayLow: y.dayLow,
          volume: y.volume,
          currency: y.currency,
          marketCap: y.marketCap ?? null,
          source: "yfinance" as const,
        };
      }
    } catch {
      // fall through
    }
    return null;
  });
}

export type UnifiedHistorical = {
  symbol: string;
  candles: PyCandle[];
  source: "yfinance";
};

export async function getHistorical(
  symbolRaw: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max" = "1y",
  interval: "1d" | "1wk" | "1mo" = "1d"
): Promise<UnifiedHistorical | null> {
  const { symbol } = resolveSymbol(symbolRaw);
  return cached(`u:hist:${symbol}:${period}:${interval}`, TTL.historical, async () => {
    try {
      const data = await pyHistorical(symbol, period, interval);
      if (!data?.candles?.length) return null;
      return { symbol, candles: data.candles, source: "yfinance" as const };
    } catch {
      return null;
    }
  });
}

export type UnifiedFundamentals = Awaited<ReturnType<typeof pyFundamentals>> & {
  source: "yfinance" | "merged";
  profile?: Record<string, string | number> | null;
};

export async function getFundamentals(symbolRaw: string): Promise<UnifiedFundamentals | null> {
  const { symbol } = resolveSymbol(symbolRaw);
  return cached(`u:fund:${symbol}`, TTL.fundamentals, async () => {
    try {
      const [yf, profile, overview] = await Promise.all([
        pyFundamentals(symbol).catch(() => null),
        fmpCompanyProfile(symbol).catch(() => null),
        avOverview(symbol).catch(() => null),
      ]);
      if (!yf) return null;
      // Prefer the richer field from AV/FMP for descriptive text where available
      const merged: UnifiedFundamentals = {
        ...yf,
        source: profile || overview ? "merged" : "yfinance",
        profile,
        summary: yf.summary || (overview?.Description as string | undefined) || (profile?.description as string | undefined) || null,
        sector: yf.sector || (overview?.Sector as string | undefined) || null,
        industry: yf.industry || (overview?.Industry as string | undefined) || null,
        country: yf.country || (overview?.Country as string | undefined) || null,
      };
      return merged;
    } catch {
      return null;
    }
  });
}

export async function getStatements(symbolRaw: string) {
  const { symbol } = resolveSymbol(symbolRaw);
  return cached(`u:statements:${symbol}`, TTL.fundamentals, async () => {
    try {
      return await pyStatements(symbol);
    } catch {
      return { income: [], balance: [], cashflow: [] };
    }
  });
}
