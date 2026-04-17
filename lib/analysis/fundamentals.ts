// Pure helpers to derive growth rates, ratios and quality badges
// from raw statement data.

import { classifyRatio } from "@/lib/utils/format";

export type RatioAssessment = {
  value: number | null;
  label: ReturnType<typeof classifyRatio>;
};

// CAGR over a period (decimal).
export function cagr(start: number | null | undefined, end: number | null | undefined, years: number): number | null {
  if (!start || !end || years <= 0 || start <= 0) return null;
  return Math.pow(end / start, 1 / years) - 1;
}

// % growth point-to-point (decimal).
export function pctGrowth(from: number | null | undefined, to: number | null | undefined): number | null {
  if (!from || !to || from === 0) return null;
  return (to - from) / Math.abs(from);
}

export function assessPE(pe: number | null | undefined): RatioAssessment {
  return { value: pe ?? null, label: classifyRatio(pe, { cheap: 15, fair: 25, expensive: 40 }, true) };
}

export function assessPB(pb: number | null | undefined): RatioAssessment {
  return { value: pb ?? null, label: classifyRatio(pb, { cheap: 1, fair: 3, expensive: 5 }, true) };
}

export function assessPS(ps: number | null | undefined): RatioAssessment {
  return { value: ps ?? null, label: classifyRatio(ps, { cheap: 1, fair: 4, expensive: 10 }, true) };
}

export function assessEvEbitda(x: number | null | undefined): RatioAssessment {
  return { value: x ?? null, label: classifyRatio(x, { cheap: 8, fair: 15, expensive: 25 }, true) };
}

export function assessROE(x: number | null | undefined): RatioAssessment {
  // ROE comes as a decimal (e.g. 0.18)
  const pct = x == null ? null : x * 100;
  return {
    value: pct,
    label: classifyRatio(pct, { cheap: 5, fair: 15, expensive: 25 }, false),
  };
}

export function assessDebtEquity(x: number | null | undefined): RatioAssessment {
  // yfinance returns percent (18 = 0.18). Normalize to ratio.
  const ratio = x == null ? null : x > 5 ? x / 100 : x;
  return {
    value: ratio,
    label: classifyRatio(ratio, { cheap: 0.5, fair: 1.5, expensive: 3 }, true),
  };
}

export function assessFcfYield(fcf: number | null | undefined, marketCap: number | null | undefined): RatioAssessment {
  if (!fcf || !marketCap || marketCap <= 0) return { value: null, label: null };
  const yieldPct = (fcf / marketCap) * 100;
  return {
    value: yieldPct,
    label: classifyRatio(yieldPct, { cheap: 2, fair: 5, expensive: 8 }, false),
  };
}

// Pull a numeric row from yfinance statements (records keyed by period).
// The statements are columns-as-periods; records come in order newest→oldest.
export function extractSeries(
  statements: Array<Record<string, number | string | null>>,
  key: string
): Array<{ period: string; value: number | null }> {
  return statements
    .map((row) => ({
      period: String(row.period ?? ""),
      value: typeof row[key] === "number" ? (row[key] as number) : null,
    }))
    .reverse(); // oldest→newest for charts
}

export function latest<T extends { value: number | null }>(series: T[]): number | null {
  for (let i = series.length - 1; i >= 0; i--) if (series[i].value != null) return series[i].value;
  return null;
}

export function firstWithValue<T extends { value: number | null }>(series: T[]): number | null {
  for (const s of series) if (s.value != null) return s.value;
  return null;
}
