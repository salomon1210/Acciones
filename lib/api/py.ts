// Bridge to the FastAPI backend (yfinance + indicators + DCF + backtest + montecarlo).

import { getClient } from "@/lib/utils/http";

const PY_BASE = process.env.PY_BACKEND_URL || "http://127.0.0.1:8001";

getClient({ name: "py", baseURL: PY_BASE, concurrency: 8, intervalCap: 20, retries: 2 });

export type PyCandle = { t: number; o: number; h: number; l: number; c: number; v: number };

export type PyQuote = {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  currency: string;
  marketCap?: number | null;
};

export type PyFundamentals = {
  symbol: string;
  name?: string | null;
  sector?: string | null;
  industry?: string | null;
  country?: string | null;
  exchange?: string | null;
  summary?: string | null;
  website?: string | null;
  marketCap?: number | null;
  enterpriseValue?: number | null;
  sharesOutstanding?: number | null;
  floatShares?: number | null;
  peRatio?: number | null;
  forwardPE?: number | null;
  pbRatio?: number | null;
  psRatio?: number | null;
  evEbitda?: number | null;
  dividendYield?: number | null;
  payoutRatio?: number | null;
  beta?: number | null;
  shortFloat?: number | null;
  insiderOwnership?: number | null;
  institutionalOwnership?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  profitMargin?: number | null;
  operatingMargin?: number | null;
  grossMargin?: number | null;
  returnOnEquity?: number | null;
  returnOnAssets?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  quickRatio?: number | null;
  revenue?: number | null;
  grossProfit?: number | null;
  ebitda?: number | null;
  netIncome?: number | null;
  freeCashFlow?: number | null;
  operatingCashflow?: number | null;
  totalCash?: number | null;
  totalDebt?: number | null;
  revenueGrowth?: number | null;
  earningsGrowth?: number | null;
  targetMeanPrice?: number | null;
  targetHighPrice?: number | null;
  targetLowPrice?: number | null;
  recommendationKey?: string | null;
  numberOfAnalystOpinions?: number | null;
};

async function call<T>(path: string, init?: RequestInit, body?: unknown): Promise<T> {
  const url = path.startsWith("http") ? path : `${PY_BASE}${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Python backend ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function pyQuote(symbol: string): Promise<PyQuote> {
  return call<PyQuote>(`/yf/quote?symbol=${encodeURIComponent(symbol)}`);
}

export async function pyHistorical(
  symbol: string,
  period: string = "1y",
  interval: string = "1d"
): Promise<{ symbol: string; candles: PyCandle[] }> {
  return call(
    `/yf/historical?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`
  );
}

export async function pyFundamentals(symbol: string): Promise<PyFundamentals> {
  return call<PyFundamentals>(`/yf/fundamentals?symbol=${encodeURIComponent(symbol)}`);
}

export async function pyStatements(symbol: string): Promise<{
  income: Array<Record<string, number | string | null>>;
  balance: Array<Record<string, number | string | null>>;
  cashflow: Array<Record<string, number | string | null>>;
}> {
  return call(`/yf/statements?symbol=${encodeURIComponent(symbol)}`);
}

export async function pyIndicators(candles: PyCandle[]) {
  return call<{
    points: Array<{
      t: number;
      rsi14: number | null;
      macd: number | null;
      macdSignal: number | null;
      macdHist: number | null;
      ema20: number | null;
      ema50: number | null;
      ema200: number | null;
      bbUpper: number | null;
      bbMiddle: number | null;
      bbLower: number | null;
      atr14: number | null;
      adx14: number | null;
      volRel: number | null;
    }>;
    snapshot: {
      pattern: string | null;
      latestClose: number;
      support: number | null;
      resistance: number | null;
    };
  }>(`/indicators`, { method: "POST" }, { candles });
}

export type DCFInput = {
  freeCashFlow: number;
  sharesOutstanding: number;
  growthRates: number[];
  terminalGrowth?: number;
  discountRate?: number;
  taxRate?: number;
  netCashPerShare?: number;
  currentPrice?: number | null;
};

export async function pyDcf(input: DCFInput) {
  return call<{
    fairValuePerShare: number;
    enterpriseValue: number;
    upside: number | null;
    projectedFCF: number[];
    discountedFCF: number[];
    terminalValue: number;
    terminalDiscounted: number;
  }>(`/dcf`, { method: "POST" }, input);
}

export async function pyBacktest(input: {
  strategy: "sma_crossover" | "rsi_mean_reversion";
  candles: Array<{ t: number; c: number }>;
  fastSMA?: number;
  slowSMA?: number;
  rsiLow?: number;
  rsiHigh?: number;
}) {
  return call<{
    totalReturn: number;
    cagr: number | null;
    maxDrawdown: number;
    sharpe: number | null;
    trades: number;
  }>(`/backtest`, { method: "POST" }, input);
}

export async function pyMonteCarlo(input: {
  currentPrice: number;
  dailyReturns: number[];
  horizonDays?: number;
  simulations?: number;
}) {
  return call<{
    mean: number;
    median: number;
    p5: number;
    p25: number;
    p75: number;
    p95: number;
    probPositive: number;
  }>(`/montecarlo`, { method: "POST" }, input);
}
