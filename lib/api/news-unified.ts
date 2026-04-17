// Unified news aggregator: pulls from every configured provider and normalizes
// each item. Dedupes by URL and sorts newest first.

import { cached, TTL } from "@/lib/utils/cache";
import { finnhubMarketNews, finnhubCompanyNews, finnhubAvailable } from "@/lib/api/finnhub";
import { marketauxNews, marketauxSentimentLabel, marketauxAvailable } from "@/lib/api/marketaux";
import { newsApiHeadlines, newsapiAvailable } from "@/lib/api/newsapi";

export type Sentiment = "positive" | "neutral" | "negative" | null;

export type UnifiedNewsItem = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  provider: "finnhub" | "marketaux" | "newsapi" | "mock";
  publishedAt: number; // ms
  image: string | null;
  tickers: string[];
  sentiment: Sentiment;
  category: "general" | "ticker" | "macro" | "crypto";
};

export type NewsQuery = {
  category?: "general" | "crypto";
  tickers?: string[];
};

function lightweightSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  const pos = ["beat", "surge", "soar", "rally", "upgrade", "record", "raise", "grows", "strong", "bullish", "outperform"];
  const neg = ["miss", "fall", "drop", "plunge", "downgrade", "cut", "warns", "loss", "probe", "lawsuit", "fraud", "bearish", "underperform"];
  let score = 0;
  for (const w of pos) if (t.includes(w)) score++;
  for (const w of neg) if (t.includes(w)) score--;
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return null;
}

export async function getUnifiedNews(query: NewsQuery = {}): Promise<UnifiedNewsItem[]> {
  const key = `news:unified:${query.category ?? "all"}:${(query.tickers ?? []).join(",")}`;
  return cached(key, TTL.news, async () => {
    const results: UnifiedNewsItem[] = [];

    if (finnhubAvailable()) {
      if (query.tickers?.length) {
        const per = await Promise.all(query.tickers.slice(0, 6).map((t) => finnhubCompanyNews(t, 3).catch(() => [])));
        for (let i = 0; i < per.length; i++) {
          const ticker = query.tickers![i];
          for (const n of per[i]) {
            results.push({
              id: `fh:${n.id}`,
              headline: n.headline,
              summary: n.summary,
              url: n.url,
              source: n.source,
              provider: "finnhub",
              publishedAt: n.datetime * 1000,
              image: n.image || null,
              tickers: [ticker],
              sentiment: lightweightSentiment(n.headline + " " + n.summary),
              category: "ticker",
            });
          }
        }
      }
      const market = await finnhubMarketNews(query.category === "crypto" ? "crypto" : "general").catch(() => []);
      for (const n of market) {
        results.push({
          id: `fh-m:${n.id}`,
          headline: n.headline,
          summary: n.summary,
          url: n.url,
          source: n.source,
          provider: "finnhub",
          publishedAt: n.datetime * 1000,
          image: n.image || null,
          tickers: n.related ? n.related.split(",").filter(Boolean) : [],
          sentiment: lightweightSentiment(n.headline + " " + n.summary),
          category: query.category === "crypto" ? "crypto" : "general",
        });
      }
    }

    if (marketauxAvailable()) {
      const items = await marketauxNews({ symbols: query.tickers, limit: 25 }).catch(() => []);
      for (const n of items) {
        const avgSentiment = n.entities?.length
          ? n.entities.reduce((a, e) => a + (e.sentiment_score ?? 0), 0) / n.entities.length
          : 0;
        results.push({
          id: `mx:${n.uuid}`,
          headline: n.title,
          summary: n.description,
          url: n.url,
          source: n.source,
          provider: "marketaux",
          publishedAt: Date.parse(n.published_at),
          image: n.image_url ?? null,
          tickers: n.entities?.map((e) => e.symbol) ?? [],
          sentiment: avgSentiment === 0 ? null : (marketauxSentimentLabel(avgSentiment) as Sentiment),
          category: n.entities?.length ? "ticker" : "general",
        });
      }
    }

    if (newsapiAvailable()) {
      const items = await newsApiHeadlines({
        query: query.tickers?.length ? query.tickers.join(" OR ") : undefined,
        category: "business",
        pageSize: 20,
      }).catch(() => []);
      for (const a of items) {
        results.push({
          id: `na:${a.url}`,
          headline: a.title,
          summary: a.description || "",
          url: a.url,
          source: a.source.name,
          provider: "newsapi",
          publishedAt: Date.parse(a.publishedAt),
          image: a.urlToImage || null,
          tickers: query.tickers ?? [],
          sentiment: lightweightSentiment(a.title + " " + (a.description ?? "")),
          category: query.category ?? "general",
        });
      }
    }

    if (!results.length) {
      // Mock fallback so the feed always renders something.
      const now = Date.now();
      return [
        {
          id: "mock:1",
          headline: "Mercados cierran mixtos mientras los inversores digieren datos macro",
          summary: "Los índices de EE. UU. cerraron en terreno mixto con el S&P plano y el Nasdaq levemente arriba.",
          url: "https://example.com/news/1",
          source: "Mock Wire",
          provider: "mock",
          publishedAt: now - 60 * 60_000,
          image: null,
          tickers: ["SPY", "QQQ"],
          sentiment: null,
          category: "general",
        },
        {
          id: "mock:2",
          headline: "NVIDIA supera expectativas y la acción sube en el after-hours",
          summary: "La empresa reportó ventas récord impulsadas por la demanda de chips para AI.",
          url: "https://example.com/news/2",
          source: "Mock Wire",
          provider: "mock",
          publishedAt: now - 2 * 60 * 60_000,
          image: null,
          tickers: ["NVDA"],
          sentiment: "positive",
          category: "ticker",
        },
        {
          id: "mock:3",
          headline: "Bitcoin rebota por encima de los $70k con flujos hacia ETFs",
          summary: "Los ETFs spot acumularon entradas netas positivas por cuarta sesión consecutiva.",
          url: "https://example.com/news/3",
          source: "Mock Wire",
          provider: "mock",
          publishedAt: now - 3 * 60 * 60_000,
          image: null,
          tickers: ["BTC-USD"],
          sentiment: "positive",
          category: "crypto",
        },
      ] as UnifiedNewsItem[];
    }

    // Dedupe by URL (first-seen wins) and sort newest first.
    const seen = new Set<string>();
    const deduped: UnifiedNewsItem[] = [];
    for (const it of results) {
      if (!it.url || seen.has(it.url)) continue;
      seen.add(it.url);
      deduped.push(it);
    }
    deduped.sort((a, b) => b.publishedAt - a.publishedAt);
    return deduped.slice(0, 60);
  });
}
