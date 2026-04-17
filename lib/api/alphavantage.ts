import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://www.alphavantage.co";
const KEY = process.env.ALPHAVANTAGE_API_KEY;

export const alphavantageAvailable = () => !!KEY;

// Free tier: 25 calls/day. Keep concurrency low.
getClient({ name: "alphavantage", baseURL: BASE, concurrency: 1, intervalCap: 5, intervalMs: 60_000, retries: 1 });

export async function avOverview(symbol: string): Promise<Record<string, string> | null> {
  if (!KEY) return null;
  return cached(`av:overview:${symbol}`, TTL.fundamentals, async () => {
    try {
      const data = await queuedGet<Record<string, string>>(
        "alphavantage",
        `/query?function=OVERVIEW&symbol=${symbol}&apikey=${KEY}`
      );
      if (!data || Object.keys(data).length <= 1 || "Note" in data) return null;
      return data;
    } catch {
      return null;
    }
  });
}

export async function avCashflowAnnual(symbol: string) {
  if (!KEY) return null;
  return cached(`av:cashflow:${symbol}`, TTL.fundamentals, async () => {
    try {
      const data = await queuedGet<{ annualReports?: Array<Record<string, string>> }>(
        "alphavantage",
        `/query?function=CASH_FLOW&symbol=${symbol}&apikey=${KEY}`
      );
      return data?.annualReports ?? null;
    } catch {
      return null;
    }
  });
}
