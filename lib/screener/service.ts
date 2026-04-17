import { UNIVERSE } from "@/lib/screener/universe";
import { getFundamentals, getHistorical } from "@/lib/api/unified";
import { pyIndicators } from "@/lib/api/py";
import { cached, TTL } from "@/lib/utils/cache";

export type ScreenerRow = {
  symbol: string;
  name: string | null;
  sector: string;
  country: string;
  marketCap: number | null;
  price: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  evEbitda: number | null;
  dividendYield: number | null;
  roe: number | null;
  debtEquity: number | null;
  revenueGrowth: number | null;
  grossMargin: number | null;
  rsi14: number | null;
  dist52wHigh: number | null;
  dist52wLow: number | null;
};

export type ScreenerFilters = {
  minMarketCap?: number;
  maxMarketCap?: number;
  sectors?: string[];
  countries?: string[];
  maxPE?: number;
  maxPS?: number;
  maxEvEbitda?: number;
  minROE?: number;
  maxDebtEquity?: number;
  minRevenueGrowth?: number;
  minDividendYield?: number;
  maxRsi?: number;
  minDistFromHigh?: number;
};

export type ScreenerPreset = {
  id: string;
  label: string;
  description: string;
  filters: ScreenerFilters;
};

export const PRESETS: ScreenerPreset[] = [
  {
    id: "deep-value",
    label: "Deep Value",
    description: "Múltiplos bajos, ROE decente, crecimiento positivo.",
    filters: { maxPE: 15, maxPS: 3, maxEvEbitda: 12, minROE: 10, minRevenueGrowth: 0 },
  },
  {
    id: "quality",
    label: "Quality Compounders",
    description: "ROE alto, márgenes fuertes, balance sano.",
    filters: { minROE: 18, maxDebtEquity: 1.5, minRevenueGrowth: 5 },
  },
  {
    id: "oversold",
    label: "Oversold Blue Chips",
    description: "Grandes caídas con RSI bajo, mercap grande.",
    filters: { minMarketCap: 50e9, maxRsi: 35, minDistFromHigh: 0.15 },
  },
  {
    id: "hi-div",
    label: "High Dividend Safe",
    description: "Dividendo atractivo con payout razonable y balance limpio.",
    filters: { minDividendYield: 0.03, maxDebtEquity: 2, minROE: 8 },
  },
];

async function fetchRow(entry: typeof UNIVERSE[number]): Promise<ScreenerRow | null> {
  try {
    const [f, hist] = await Promise.all([
      getFundamentals(entry.symbol).catch(() => null),
      getHistorical(entry.symbol, "3mo", "1d").catch(() => null),
    ]);
    if (!f) return null;

    let rsi: number | null = null;
    let dist52wHigh: number | null = null;
    let dist52wLow: number | null = null;
    if (hist?.candles.length) {
      try {
        const ind = await pyIndicators(hist.candles);
        rsi = ind.points[ind.points.length - 1]?.rsi14 ?? null;
      } catch {
        // ignore
      }
      const last = hist.candles[hist.candles.length - 1]?.c ?? null;
      if (last && f.fiftyTwoWeekHigh) dist52wHigh = (f.fiftyTwoWeekHigh - last) / f.fiftyTwoWeekHigh;
      if (last && f.fiftyTwoWeekLow) dist52wLow = (last - f.fiftyTwoWeekLow) / f.fiftyTwoWeekLow;
    }

    return {
      symbol: entry.symbol,
      name: f.name ?? null,
      sector: entry.sector,
      country: entry.country,
      marketCap: f.marketCap ?? null,
      price: null,
      peRatio: f.peRatio ?? null,
      pbRatio: f.pbRatio ?? null,
      psRatio: f.psRatio ?? null,
      evEbitda: f.evEbitda ?? null,
      dividendYield: f.dividendYield ?? null,
      roe: f.returnOnEquity ?? null,
      debtEquity: f.debtToEquity ?? null,
      revenueGrowth: f.revenueGrowth ?? null,
      grossMargin: f.grossMargin ?? null,
      rsi14: rsi,
      dist52wHigh,
      dist52wLow,
    };
  } catch {
    return null;
  }
}

export async function buildScreenerSnapshot(): Promise<ScreenerRow[]> {
  return cached("screener:snapshot:v1", TTL.fundamentals / 2, async () => {
    const results: ScreenerRow[] = [];
    // Batch in groups of 6 to avoid hammering providers.
    for (let i = 0; i < UNIVERSE.length; i += 6) {
      const batch = UNIVERSE.slice(i, i + 6);
      const out = await Promise.all(batch.map((e) => fetchRow(e)));
      for (const r of out) if (r) results.push(r);
    }
    return results;
  });
}

export function applyFilters(rows: ScreenerRow[], filters: ScreenerFilters): ScreenerRow[] {
  return rows.filter((r) => {
    if (filters.minMarketCap != null && (r.marketCap ?? 0) < filters.minMarketCap) return false;
    if (filters.maxMarketCap != null && (r.marketCap ?? Infinity) > filters.maxMarketCap) return false;
    if (filters.sectors?.length && !filters.sectors.includes(r.sector)) return false;
    if (filters.countries?.length && !filters.countries.includes(r.country)) return false;
    if (filters.maxPE != null && (r.peRatio == null || r.peRatio > filters.maxPE)) return false;
    if (filters.maxPS != null && (r.psRatio == null || r.psRatio > filters.maxPS)) return false;
    if (filters.maxEvEbitda != null && (r.evEbitda == null || r.evEbitda > filters.maxEvEbitda)) return false;
    if (filters.minROE != null && ((r.roe ?? 0) * 100 < filters.minROE)) return false;
    if (filters.maxDebtEquity != null) {
      const de = r.debtEquity != null && r.debtEquity > 5 ? r.debtEquity / 100 : r.debtEquity;
      if (de == null || de > filters.maxDebtEquity) return false;
    }
    if (filters.minRevenueGrowth != null && ((r.revenueGrowth ?? 0) * 100 < filters.minRevenueGrowth)) return false;
    if (filters.minDividendYield != null && ((r.dividendYield ?? 0) < filters.minDividendYield)) return false;
    if (filters.maxRsi != null && (r.rsi14 == null || r.rsi14 > filters.maxRsi)) return false;
    if (filters.minDistFromHigh != null && (r.dist52wHigh == null || r.dist52wHigh < filters.minDistFromHigh)) return false;
    return true;
  });
}
