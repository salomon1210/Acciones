// Preset universe of US large/mid caps with sector tags so the screener works
// offline via yfinance bulk fetch. Users can extend this list through .env
// or by importing their own watchlist (Phase 10).

export type UniverseEntry = { symbol: string; sector: string; country: string };

export const UNIVERSE: UniverseEntry[] = [
  // Tech
  { symbol: "AAPL", sector: "Technology", country: "USA" },
  { symbol: "MSFT", sector: "Technology", country: "USA" },
  { symbol: "GOOGL", sector: "Technology", country: "USA" },
  { symbol: "META", sector: "Technology", country: "USA" },
  { symbol: "NVDA", sector: "Technology", country: "USA" },
  { symbol: "AMZN", sector: "Consumer Discretionary", country: "USA" },
  { symbol: "ADBE", sector: "Technology", country: "USA" },
  { symbol: "CRM", sector: "Technology", country: "USA" },
  { symbol: "ORCL", sector: "Technology", country: "USA" },
  { symbol: "AMD", sector: "Technology", country: "USA" },
  { symbol: "AVGO", sector: "Technology", country: "USA" },
  { symbol: "TSM", sector: "Technology", country: "Taiwan" },
  { symbol: "TSLA", sector: "Consumer Discretionary", country: "USA" },
  // Financials
  { symbol: "JPM", sector: "Financials", country: "USA" },
  { symbol: "BAC", sector: "Financials", country: "USA" },
  { symbol: "GS", sector: "Financials", country: "USA" },
  { symbol: "V", sector: "Financials", country: "USA" },
  { symbol: "MA", sector: "Financials", country: "USA" },
  { symbol: "BRK-B", sector: "Financials", country: "USA" },
  { symbol: "SCHW", sector: "Financials", country: "USA" },
  // Healthcare
  { symbol: "JNJ", sector: "Healthcare", country: "USA" },
  { symbol: "PFE", sector: "Healthcare", country: "USA" },
  { symbol: "UNH", sector: "Healthcare", country: "USA" },
  { symbol: "LLY", sector: "Healthcare", country: "USA" },
  { symbol: "ABBV", sector: "Healthcare", country: "USA" },
  { symbol: "MRK", sector: "Healthcare", country: "USA" },
  // Consumer
  { symbol: "PG", sector: "Consumer Staples", country: "USA" },
  { symbol: "KO", sector: "Consumer Staples", country: "USA" },
  { symbol: "PEP", sector: "Consumer Staples", country: "USA" },
  { symbol: "WMT", sector: "Consumer Staples", country: "USA" },
  { symbol: "COST", sector: "Consumer Staples", country: "USA" },
  { symbol: "HD", sector: "Consumer Discretionary", country: "USA" },
  { symbol: "NKE", sector: "Consumer Discretionary", country: "USA" },
  { symbol: "MCD", sector: "Consumer Discretionary", country: "USA" },
  // Industrials
  { symbol: "CAT", sector: "Industrials", country: "USA" },
  { symbol: "BA", sector: "Industrials", country: "USA" },
  { symbol: "HON", sector: "Industrials", country: "USA" },
  { symbol: "GE", sector: "Industrials", country: "USA" },
  // Energy
  { symbol: "XOM", sector: "Energy", country: "USA" },
  { symbol: "CVX", sector: "Energy", country: "USA" },
  { symbol: "COP", sector: "Energy", country: "USA" },
  // Utilities / telecom
  { symbol: "NEE", sector: "Utilities", country: "USA" },
  { symbol: "VZ", sector: "Communication Services", country: "USA" },
  { symbol: "T", sector: "Communication Services", country: "USA" },
  { symbol: "NFLX", sector: "Communication Services", country: "USA" },
  { symbol: "DIS", sector: "Communication Services", country: "USA" },
  // Materials / real estate
  { symbol: "LIN", sector: "Materials", country: "USA" },
  { symbol: "APD", sector: "Materials", country: "USA" },
  { symbol: "PLD", sector: "Real Estate", country: "USA" },
  // International
  { symbol: "NVO", sector: "Healthcare", country: "Denmark" },
  { symbol: "ASML", sector: "Technology", country: "Netherlands" },
  { symbol: "TM", sector: "Consumer Discretionary", country: "Japan" },
];

export const SECTORS = Array.from(new Set(UNIVERSE.map((u) => u.sector))).sort();
export const COUNTRIES = Array.from(new Set(UNIVERSE.map((u) => u.country))).sort();
