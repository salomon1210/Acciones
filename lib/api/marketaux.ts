import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://api.marketaux.com/v1";
const KEY = process.env.MARKETAUX_API_KEY;

export const marketauxAvailable = () => !!KEY;

getClient({ name: "marketaux", baseURL: BASE, concurrency: 2, intervalCap: 8, intervalMs: 1000, retries: 2 });

export type MarketauxItem = {
  uuid: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string | null;
  entities?: Array<{
    symbol: string;
    name: string;
    sentiment_score: number;
    highlights?: Array<{ highlight: string; sentiment: number }>;
  }>;
};

export async function marketauxNews(opts: {
  symbols?: string[];
  countries?: string[];
  limit?: number;
} = {}) {
  if (!KEY) return [];
  const { symbols, countries, limit = 20 } = opts;
  const cacheKey = `marketaux:news:${symbols?.join(",") ?? "all"}:${countries?.join(",") ?? "all"}:${limit}`;
  return cached(cacheKey, TTL.news, async () => {
    try {
      const params: string[] = [`api_token=${KEY}`, `limit=${limit}`, "language=en"];
      if (symbols?.length) params.push(`symbols=${symbols.join(",")}`);
      if (countries?.length) params.push(`countries=${countries.join(",")}`);
      const data = await queuedGet<{ data: MarketauxItem[] }>(
        "marketaux",
        `/news/all?${params.join("&")}`
      );
      return data?.data ?? [];
    } catch {
      return [];
    }
  });
}

export function marketauxSentimentLabel(score: number): "positive" | "neutral" | "negative" {
  if (score > 0.15) return "positive";
  if (score < -0.15) return "negative";
  return "neutral";
}
