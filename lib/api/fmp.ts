import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://financialmodelingprep.com/api/v3";
const KEY = process.env.FMP_API_KEY;

export const fmpAvailable = () => !!KEY;

getClient({ name: "fmp", baseURL: BASE, concurrency: 3, intervalCap: 10, intervalMs: 1000, retries: 2 });

export type FmpPeer = { symbol: string; peersList?: string[] };

export async function fmpPeers(symbol: string): Promise<string[]> {
  if (!KEY) return [];
  return cached(`fmp:peers:${symbol}`, TTL.peers, async () => {
    try {
      const data = await queuedGet<FmpPeer[]>(
        "fmp",
        `/stock_peers?symbol=${symbol}&apikey=${KEY}`
      );
      return data?.[0]?.peersList ?? [];
    } catch {
      return [];
    }
  });
}

export async function fmpAnalystEstimates(symbol: string) {
  if (!KEY) return [];
  return cached(`fmp:estimates:${symbol}`, TTL.fundamentals, async () => {
    try {
      return await queuedGet<Array<{
        date: string;
        estimatedRevenueLow: number;
        estimatedRevenueHigh: number;
        estimatedRevenueAvg: number;
        estimatedEpsLow: number;
        estimatedEpsHigh: number;
        estimatedEpsAvg: number;
        numberAnalystEstimatedRevenue: number;
        numberAnalystEstimatedEps: number;
      }>>("fmp", `/analyst-estimates/${symbol}?apikey=${KEY}`);
    } catch {
      return [];
    }
  });
}

export async function fmpRatiosTTM(symbol: string) {
  if (!KEY) return null;
  return cached(`fmp:ratios-ttm:${symbol}`, TTL.fundamentals, async () => {
    try {
      const rows = await queuedGet<Array<Record<string, number>>>(
        "fmp",
        `/ratios-ttm/${symbol}?apikey=${KEY}`
      );
      return rows?.[0] ?? null;
    } catch {
      return null;
    }
  });
}

export async function fmpKeyMetricsTTM(symbol: string) {
  if (!KEY) return null;
  return cached(`fmp:keymetrics-ttm:${symbol}`, TTL.fundamentals, async () => {
    try {
      const rows = await queuedGet<Array<Record<string, number>>>(
        "fmp",
        `/key-metrics-ttm/${symbol}?apikey=${KEY}`
      );
      return rows?.[0] ?? null;
    } catch {
      return null;
    }
  });
}

export async function fmpCompanyProfile(symbol: string) {
  if (!KEY) return null;
  return cached(`fmp:profile:${symbol}`, TTL.fundamentals, async () => {
    try {
      const rows = await queuedGet<Array<Record<string, string | number>>>(
        "fmp",
        `/profile/${symbol}?apikey=${KEY}`
      );
      return rows?.[0] ?? null;
    } catch {
      return null;
    }
  });
}
