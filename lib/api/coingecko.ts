import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://api.coingecko.com/api/v3";
const KEY = process.env.COINGECKO_API_KEY;

export const coingeckoAvailable = () => true; // free tier works without key

getClient({ name: "coingecko", baseURL: BASE, concurrency: 2, intervalCap: 20, intervalMs: 60_000, retries: 2 });

function authParam(): string {
  return KEY ? `&x_cg_demo_api_key=${KEY}` : "";
}

export async function cgPrice(coinIds: string[], vs = "usd") {
  const key = `cg:price:${coinIds.sort().join(",")}:${vs}`;
  return cached(key, TTL.crypto, async () => {
    try {
      const data = await queuedGet<Record<string, Record<string, number>>>(
        "coingecko",
        `/simple/price?ids=${coinIds.join(",")}&vs_currencies=${vs}&include_24hr_change=true${authParam()}`
      );
      return data;
    } catch {
      return {};
    }
  });
}

export async function cgGlobal() {
  return cached(`cg:global`, TTL.crypto * 5, async () => {
    try {
      const data = await queuedGet<{ data: { total_market_cap: Record<string, number>; market_cap_percentage: Record<string, number>; market_cap_change_percentage_24h_usd: number } }>(
        "coingecko",
        `/global?${authParam().slice(1)}`
      );
      return data?.data ?? null;
    } catch {
      return null;
    }
  });
}

// Map common tickers to CoinGecko IDs
export const CG_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  UNI: "uniswap",
};
