// Detects asset type from a user query and normalizes the symbol.

export type AssetType = "equity" | "etf" | "crypto" | "bond" | "index" | "fx";

export type ResolvedSymbol = {
  symbol: string;         // canonical symbol, e.g. "AAPL", "BTC-USD", "^TNX"
  raw: string;            // what the user typed
  assetType: AssetType;
  label: string;          // human-friendly
};

const KNOWN_ETFS = new Set([
  "SPY", "QQQ", "DIA", "IWM", "VTI", "VOO", "SCHD", "TLT", "GLD", "SLV",
  "XLK", "XLF", "XLE", "XLV", "XLY", "XLI", "XLP", "XLU", "XLB", "XLRE",
  "ARKK", "ARKG", "EEM", "EFA", "IEMG", "AGG", "HYG", "LQD", "BND",
]);

const COMMON_CRYPTO = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC",
  "LINK", "LTC", "BCH", "UNI", "NEAR", "ATOM", "ARB", "OP",
]);

const INDEX_MAP: Record<string, string> = {
  SPX: "^GSPC",
  NDX: "^NDX",
  DJI: "^DJI",
  RUT: "^RUT",
  VIX: "^VIX",
  UST10Y: "^TNX",
  UST30Y: "^TYX",
};

export function resolveSymbol(query: string): ResolvedSymbol {
  const raw = query.trim();
  const up = raw.toUpperCase();

  // Index aliases
  if (INDEX_MAP[up]) {
    return { symbol: INDEX_MAP[up], raw, assetType: "index", label: up };
  }
  if (up.startsWith("^")) {
    return { symbol: up, raw, assetType: "index", label: up };
  }

  // Already a crypto pair
  if (/-USD$/.test(up) || /USDT$/.test(up)) {
    return { symbol: up, raw, assetType: "crypto", label: up };
  }

  if (COMMON_CRYPTO.has(up)) {
    return { symbol: `${up}-USD`, raw, assetType: "crypto", label: `${up}/USD` };
  }

  // FX (EUR-USD, USD-JPY etc)
  if (/^[A-Z]{3}-[A-Z]{3}$/.test(up)) {
    return { symbol: `${up}=X`.replace("-", ""), raw, assetType: "fx", label: up };
  }

  // ETFs (well-known)
  if (KNOWN_ETFS.has(up)) {
    return { symbol: up, raw, assetType: "etf", label: up };
  }

  // Bonds (free-form heuristic) — default to equity otherwise
  if (/^[A-Z]{1,6}(-[A-Z])?$/.test(up)) {
    return { symbol: up, raw, assetType: "equity", label: up };
  }

  return { symbol: up, raw, assetType: "equity", label: up };
}

export function prettyAssetType(t: AssetType): string {
  switch (t) {
    case "equity": return "Acción";
    case "etf": return "ETF";
    case "crypto": return "Cripto";
    case "bond": return "Bono";
    case "index": return "Índice";
    case "fx": return "Divisa";
  }
}
