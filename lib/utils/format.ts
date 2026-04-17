// Formatting helpers for numbers, percentages, currency and tickers.
// All UI-visible strings are Spanish (Argentinian neutral).

const NBSP = "\u00A0";

export function formatNumber(
  value: number | null | undefined,
  opts: { decimals?: number; compact?: boolean; fallback?: string } = {}
): string {
  const { decimals = 2, compact = false, fallback = "—" } = opts;
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e12) return `${(value / 1e12).toFixed(decimals)}T`;
    if (abs >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  value: number | null | undefined,
  opts: { currency?: string; decimals?: number; compact?: boolean; fallback?: string } = {}
): string {
  const { currency = "USD", decimals = 2, compact = false, fallback = "—" } = opts;
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  const symbol = currency === "USD" ? "$" : currency + NBSP;
  return `${symbol}${formatNumber(value, { decimals, compact })}`;
}

export function formatPercent(
  value: number | null | undefined,
  opts: { decimals?: number; signed?: boolean; fallback?: string; scale?: "unit" | "percent" } = {}
): string {
  const { decimals = 2, signed = true, fallback = "—", scale = "unit" } = opts;
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  const v = scale === "unit" ? value * 100 : value;
  const sign = signed && v > 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}%`;
}

export function formatDelta(
  value: number | null | undefined,
  opts: { decimals?: number; fallback?: string } = {}
): string {
  const { decimals = 2, fallback = "—" } = opts;
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

export function signClass(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0)
    return "text-fg-dim";
  return value > 0 ? "pos-text" : "neg-text";
}

export function formatTicker(symbol: string): string {
  return symbol.toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
}

export function relativeTime(date: Date | string | number): string {
  const d = typeof date === "object" ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function classifyRatio(
  value: number | null | undefined,
  thresholds: { cheap: number; fair: number; expensive: number },
  lowerIsBetter = true
): "barato" | "razonable" | "caro" | "muy caro" | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const { cheap, fair, expensive } = thresholds;
  if (lowerIsBetter) {
    if (value <= cheap) return "barato";
    if (value <= fair) return "razonable";
    if (value <= expensive) return "caro";
    return "muy caro";
  }
  if (value >= expensive) return "barato";
  if (value >= fair) return "razonable";
  if (value >= cheap) return "caro";
  return "muy caro";
}

export function ratioBadgeVariant(
  label: ReturnType<typeof classifyRatio>
): "pos" | "info" | "warn" | "neg" | "default" {
  if (label === "barato") return "pos";
  if (label === "razonable") return "info";
  if (label === "caro") return "warn";
  if (label === "muy caro") return "neg";
  return "default";
}
