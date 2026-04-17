import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://newsapi.org/v2";
const KEY = process.env.NEWSAPI_KEY;

export const newsapiAvailable = () => !!KEY;

getClient({ name: "newsapi", baseURL: BASE, concurrency: 2, intervalCap: 10, intervalMs: 1000, retries: 2 });

export type NewsApiItem = {
  source: { name: string };
  author?: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
};

export async function newsApiHeadlines(opts: { query?: string; category?: string; pageSize?: number } = {}) {
  if (!KEY) return [];
  const { query, category = "business", pageSize = 20 } = opts;
  return cached(`newsapi:${query ?? ""}:${category}:${pageSize}`, TTL.news, async () => {
    try {
      const params: string[] = [`apiKey=${KEY}`, `pageSize=${pageSize}`];
      if (query) {
        params.push(`q=${encodeURIComponent(query)}`);
        const data = await queuedGet<{ articles: NewsApiItem[] }>(
          "newsapi",
          `/everything?${params.join("&")}&language=en&sortBy=publishedAt`
        );
        return data?.articles ?? [];
      }
      params.push(`category=${category}`, "language=en", "country=us");
      const data = await queuedGet<{ articles: NewsApiItem[] }>(
        "newsapi",
        `/top-headlines?${params.join("&")}`
      );
      return data?.articles ?? [];
    } catch {
      return [];
    }
  });
}
