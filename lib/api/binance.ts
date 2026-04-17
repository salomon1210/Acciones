import crypto from "node:crypto";
import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://api.binance.com";
const KEY = process.env.BINANCE_API_KEY;
const SECRET = process.env.BINANCE_API_SECRET;

export const binanceAvailable = () => !!KEY && !!SECRET;

getClient({ name: "binance", baseURL: BASE, concurrency: 3, intervalCap: 20, intervalMs: 1000, retries: 2 });

function sign(query: string): string {
  if (!SECRET) return "";
  return crypto.createHmac("sha256", SECRET).update(query).digest("hex");
}

type AccountResponse = {
  balances: Array<{ asset: string; free: string; locked: string }>;
  accountType?: string;
  canTrade?: boolean;
  canWithdraw?: boolean;
  canDeposit?: boolean;
};

export async function binanceAccount() {
  if (!KEY || !SECRET) return null;
  const ts = Date.now();
  const qs = `timestamp=${ts}&recvWindow=10000`;
  const sig = sign(qs);
  try {
    const res = await fetch(`${BASE}/api/v3/account?${qs}&signature=${sig}`, {
      headers: { "X-MBX-APIKEY": KEY },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AccountResponse;
  } catch {
    return null;
  }
}

export async function binanceAllTickers() {
  return cached(`binance:tickers`, 60, async () => {
    try {
      return await queuedGet<Array<{ symbol: string; price: string }>>(
        "binance",
        `/api/v3/ticker/price`
      );
    } catch {
      return [];
    }
  });
}

export async function binanceTicker24h(symbol: string) {
  return cached(`binance:24h:${symbol}`, TTL.crypto, async () => {
    try {
      return await queuedGet<{
        symbol: string;
        priceChangePercent: string;
        lastPrice: string;
        volume: string;
        highPrice: string;
        lowPrice: string;
      }>("binance", `/api/v3/ticker/24hr?symbol=${symbol}`);
    } catch {
      return null;
    }
  });
}
