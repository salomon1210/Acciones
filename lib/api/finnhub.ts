import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://finnhub.io/api/v1";
const KEY = process.env.FINNHUB_API_KEY;

export const finnhubAvailable = () => !!KEY;

getClient({ name: "finnhub", baseURL: BASE, concurrency: 4, intervalCap: 50, intervalMs: 60_000, retries: 2 });

type QuoteResp = { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number };

export async function finnhubQuote(symbol: string) {
  if (!KEY) return null;
  return cached(`finnhub:quote:${symbol}`, TTL.quote, async () => {
    try {
      const data = await queuedGet<QuoteResp>(
        "finnhub",
        `/quote?symbol=${encodeURIComponent(symbol)}&token=${KEY}`
      );
      if (!data || !data.c) return null;
      return {
        price: data.c,
        prevClose: data.pc,
        change: data.d,
        changePct: data.dp / 100,
        dayHigh: data.h,
        dayLow: data.l,
        dayOpen: data.o,
      };
    } catch {
      return null;
    }
  });
}

export type FinnhubNewsItem = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

export async function finnhubCompanyNews(symbol: string, daysBack = 14): Promise<FinnhubNewsItem[]> {
  if (!KEY) return [];
  return cached(`finnhub:news:${symbol}:${daysBack}`, TTL.news, async () => {
    try {
      const to = new Date();
      const from = new Date(Date.now() - daysBack * 86400 * 1000);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const data = await queuedGet<FinnhubNewsItem[]>(
        "finnhub",
        `/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}&token=${KEY}`
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
}

export type FinnhubMarketNews = FinnhubNewsItem;

export async function finnhubMarketNews(category: string = "general"): Promise<FinnhubMarketNews[]> {
  if (!KEY) return [];
  return cached(`finnhub:market-news:${category}`, TTL.news, async () => {
    try {
      const data = await queuedGet<FinnhubMarketNews[]>(
        "finnhub",
        `/news?category=${category}&token=${KEY}`
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
}

export async function finnhubEarningsCalendar(from: Date, to: Date, symbol?: string) {
  if (!KEY) return [];
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const key = `finnhub:earnings:${fmt(from)}:${fmt(to)}:${symbol ?? "all"}`;
  return cached(key, TTL.fundamentals / 4, async () => {
    try {
      const params = [`from=${fmt(from)}`, `to=${fmt(to)}`];
      if (symbol) params.push(`symbol=${symbol}`);
      const data = await queuedGet<{ earningsCalendar: Array<{ date: string; epsActual: number | null; epsEstimate: number | null; hour: string; quarter: number; revenueActual: number | null; revenueEstimate: number | null; symbol: string; year: number }> }>(
        "finnhub",
        `/calendar/earnings?${params.join("&")}&token=${KEY}`
      );
      return data?.earningsCalendar ?? [];
    } catch {
      return [];
    }
  });
}

export async function finnhubInsiderTransactions(symbol: string) {
  if (!KEY) return [];
  return cached(`finnhub:insider:${symbol}`, TTL.fundamentals, async () => {
    try {
      const data = await queuedGet<{ data: Array<{ filingDate: string; transactionDate: string; name: string; share: number; change: number; transactionPrice: number; transactionCode: string }> }>(
        "finnhub",
        `/stock/insider-transactions?symbol=${symbol}&token=${KEY}`
      );
      return data?.data ?? [];
    } catch {
      return [];
    }
  });
}

export async function finnhubRecommendationTrends(symbol: string) {
  if (!KEY) return [];
  return cached(`finnhub:reco:${symbol}`, TTL.fundamentals, async () => {
    try {
      return await queuedGet<Array<{ buy: number; hold: number; period: string; sell: number; strongBuy: number; strongSell: number; symbol: string }>>(
        "finnhub",
        `/stock/recommendation?symbol=${symbol}&token=${KEY}`
      );
    } catch {
      return [];
    }
  });
}
