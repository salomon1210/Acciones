export type PositionRow = {
  id: number;
  source: "binance" | "broker-csv" | "manual";
  symbol: string;
  assetType: "equity" | "etf" | "crypto" | "bond" | "index" | "fx";
  quantity: number;
  avgCost: number;
  currency: string;
  sector: string | null;
  geography: string | null;
  price: number | null;
  marketValue: number | null;
  costBasis: number;
  pnlAbs: number | null;
  pnlPct: number | null;
  dayChangePct: number | null;
};

export type PortfolioSummary = {
  positions: PositionRow[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPct: number;
  dayPnl: number;
  dayPnlPct: number;
  byClass: Record<string, number>;
  byGeography: Record<string, number>;
  bySector: Record<string, number>;
};
