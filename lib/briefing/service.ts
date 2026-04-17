import { prisma } from "@/lib/db/prisma";
import { getQuote } from "@/lib/api/unified";
import { finnhubEarningsCalendar } from "@/lib/api/finnhub";
import { getUnifiedNews } from "@/lib/api/news-unified";
import { getPortfolioSummary } from "@/lib/portfolio/service";
import { generateBriefing } from "@/lib/api/claude";

const INDEX_SYMBOLS: Record<string, string> = {
  "S&P 500": "^GSPC",
  Nasdaq: "^IXIC",
  Dow: "^DJI",
  BTC: "BTC-USD",
  Gold: "GC=F",
  "US 10Y": "^TNX",
  "DXY": "DX-Y.NYB",
};

export type BriefingData = {
  date: string;
  indices: Record<string, { change: number; price: number }>;
  portfolioMovers: Array<{ symbol: string; pct: number }>;
  topNews: string[];
  earningsToday: Array<{ symbol: string; when: string }>;
  portfolioYtd?: number;
  spyYtd?: number;
};

export async function buildBriefingData(): Promise<BriefingData> {
  const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const indicesEntries = await Promise.all(
    Object.entries(INDEX_SYMBOLS).map(async ([label, sym]) => {
      const q = await getQuote(sym).catch(() => null);
      if (!q) return null;
      return [label, { change: q.changePct, price: q.price }] as const;
    })
  );
  const indices: Record<string, { change: number; price: number }> = {};
  for (const e of indicesEntries) if (e) indices[e[0]] = e[1];

  const summary = await getPortfolioSummary().catch(() => null);
  const watchlist = await prisma.watchlist.findMany().catch(() => []);
  const symbolsOfInterest = new Set<string>();
  if (summary) for (const p of summary.positions) symbolsOfInterest.add(p.symbol);
  for (const w of watchlist) symbolsOfInterest.add(w.symbol);

  const moverSymbols = Array.from(symbolsOfInterest).slice(0, 15);
  const moverQuotes = await Promise.all(moverSymbols.map((s) => getQuote(s).catch(() => null)));
  const portfolioMovers = moverQuotes
    .map((q, i) => (q ? { symbol: moverSymbols[i], pct: q.changePct } : null))
    .filter((x): x is { symbol: string; pct: number } => !!x)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 6);

  const newsItems = await getUnifiedNews({ tickers: moverSymbols }).catch(() => []);
  const topNews = newsItems.slice(0, 8).map((n) => `${n.headline} (${n.source})`);

  const from = new Date();
  const to = new Date(Date.now() + 86400_000);
  const cal = await finnhubEarningsCalendar(from, to).catch(() => []);
  const earningsToday = cal
    .filter((c) => moverSymbols.includes(c.symbol))
    .slice(0, 8)
    .map((c) => ({ symbol: c.symbol, when: c.hour || c.date }));

  return { date, indices, portfolioMovers, topNews, earningsToday };
}

function heuristicBriefing(data: BriefingData): string {
  const lines: string[] = [];
  lines.push(`# Briefing del ${data.date}`);
  lines.push("");
  lines.push("_Generado sin IA (no hay ANTHROPIC_API_KEY configurada). Una vez que la cargues, el briefing será más rico._");
  lines.push("");
  lines.push("## Mercados hoy");
  const idx = Object.entries(data.indices);
  if (idx.length === 0) {
    lines.push("No pude traer los índices principales.");
  } else {
    for (const [label, { change, price }] of idx) {
      const sign = change >= 0 ? "+" : "";
      lines.push(`- **${label}**: ${price.toFixed(2)} (${sign}${(change * 100).toFixed(2)}%)`);
    }
  }
  lines.push("");
  lines.push("## Movimientos en tu radar");
  if (data.portfolioMovers.length === 0) {
    lines.push("Sin movimientos llamativos.");
  } else {
    for (const m of data.portfolioMovers) {
      const sign = m.pct >= 0 ? "+" : "";
      lines.push(`- ${m.symbol}: ${sign}${(m.pct * 100).toFixed(2)}%`);
    }
  }
  lines.push("");
  lines.push("## Noticias destacadas");
  if (data.topNews.length === 0) {
    lines.push("No hay noticias relevantes en tu universo.");
  } else {
    for (const n of data.topNews.slice(0, 5)) lines.push(`- ${n}`);
  }
  lines.push("");
  lines.push("## Earnings hoy");
  if (data.earningsToday.length === 0) {
    lines.push("Nada que reportar.");
  } else {
    for (const e of data.earningsToday) lines.push(`- ${e.symbol} (${e.when})`);
  }
  lines.push("");
  lines.push("## Pregunta del día");
  lines.push("¿Qué posición de tu portfolio tiene la tesis más débil si los próximos earnings decepcionan?");
  return lines.join("\n");
}

export async function generateBriefingMarkdown(): Promise<{ markdown: string; data: BriefingData; aiUsed: boolean }> {
  const data = await buildBriefingData();
  const ai = await generateBriefing(data).catch(() => null);
  if (ai && ai.trim().length > 0) {
    return { markdown: ai, data, aiUsed: true };
  }
  return { markdown: heuristicBriefing(data), data, aiUsed: false };
}

export async function generateAndPersistBriefing() {
  const { markdown, data, aiUsed } = await generateBriefingMarkdown();
  const row = await prisma.briefing.create({
    data: {
      markdown,
      metadata: JSON.stringify({ aiUsed, data }),
    },
  });
  return row;
}
