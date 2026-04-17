import type { PyCandle } from "@/lib/api/py";

export function dailyReturns(candles: PyCandle[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].c;
    if (prev > 0) out.push((candles[i].c - prev) / prev);
  }
  return out;
}

export function annualizedVol(candles: PyCandle[]): number | null {
  const r = dailyReturns(candles);
  if (r.length < 20) return null;
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length;
  return Math.sqrt(variance) * Math.sqrt(252);
}

export function maxDrawdown(candles: PyCandle[]): number | null {
  if (candles.length < 2) return null;
  let peak = -Infinity;
  let minDd = 0;
  for (const c of candles) {
    if (c.c > peak) peak = c.c;
    const dd = peak > 0 ? c.c / peak - 1 : 0;
    if (dd < minDd) minDd = dd;
  }
  return minDd;
}

export function sharpeRatio(candles: PyCandle[], riskFree = 0.045): number | null {
  const r = dailyReturns(candles);
  if (r.length < 30) return null;
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length;
  const std = Math.sqrt(variance);
  if (std === 0) return null;
  const dailyRf = riskFree / 252;
  return ((mean - dailyRf) / std) * Math.sqrt(252);
}

export function sortinoRatio(candles: PyCandle[], riskFree = 0.045): number | null {
  const r = dailyReturns(candles);
  if (r.length < 30) return null;
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const downside = r.filter((x) => x < 0);
  if (!downside.length) return null;
  const downVar = downside.reduce((a, b) => a + b ** 2, 0) / downside.length;
  const downStd = Math.sqrt(downVar);
  if (downStd === 0) return null;
  const dailyRf = riskFree / 252;
  return ((mean - dailyRf) / downStd) * Math.sqrt(252);
}

export function correlation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 30) return null;
  let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (let i = 0; i < n; i++) {
    sa += a[i]; sb += b[i]; saa += a[i] * a[i]; sbb += b[i] * b[i]; sab += a[i] * b[i];
  }
  const cov = sab / n - (sa / n) * (sb / n);
  const sdA = Math.sqrt(saa / n - (sa / n) ** 2);
  const sdB = Math.sqrt(sbb / n - (sb / n) ** 2);
  if (sdA === 0 || sdB === 0) return null;
  return cov / (sdA * sdB);
}

export function beta(asset: number[], market: number[]): number | null {
  const n = Math.min(asset.length, market.length);
  if (n < 30) return null;
  let sm = 0, smm = 0, sam = 0, sa = 0;
  for (let i = 0; i < n; i++) {
    sm += market[i]; sa += asset[i]; smm += market[i] ** 2; sam += asset[i] * market[i];
  }
  const cov = sam / n - (sa / n) * (sm / n);
  const varM = smm / n - (sm / n) ** 2;
  if (varM === 0) return null;
  return cov / varM;
}
