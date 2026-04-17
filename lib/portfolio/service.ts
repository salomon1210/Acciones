import { prisma } from "@/lib/db/prisma";
import { getQuote } from "@/lib/api/unified";
import { cgPrice, CG_IDS } from "@/lib/api/coingecko";
import { binanceAccount, binanceAllTickers, binanceAvailable } from "@/lib/api/binance";
import { resolveSymbol } from "@/lib/api/resolver";
import type { PositionRow, PortfolioSummary } from "@/lib/portfolio/types";

const IGNORE_BINANCE_ASSETS = new Set(["LDUSDT", "LDUSDC", "LDBNB", "NFT", "ETHW"]);

// Sync live Binance balances into the Position table (source = binance).
export async function syncBinancePositions() {
  if (!binanceAvailable()) return { synced: 0, skipped: true };
  const account = await binanceAccount();
  if (!account) return { synced: 0, skipped: true };

  const tickers = await binanceAllTickers();
  const priceUSDT = new Map<string, number>();
  for (const t of tickers) priceUSDT.set(t.symbol, Number(t.price));

  const nonZero = account.balances
    .map((b) => ({ asset: b.asset, total: Number(b.free) + Number(b.locked) }))
    .filter((b) => b.total > 0 && !IGNORE_BINANCE_ASSETS.has(b.asset));

  let synced = 0;
  for (const b of nonZero) {
    const symUSDT = `${b.asset}USDT`;
    let avgCost = priceUSDT.get(symUSDT) ?? 0;
    if (b.asset === "USDT" || b.asset === "USDC" || b.asset === "BUSD" || b.asset === "FDUSD") avgCost = 1;

    await prisma.position.upsert({
      where: { source_symbol: { source: "binance", symbol: b.asset } },
      update: { quantity: b.total, avgCost },
      create: {
        source: "binance",
        symbol: b.asset,
        assetType: "crypto",
        quantity: b.total,
        avgCost,
        currency: "USD",
        sector: "Cripto",
        geography: "Global",
      },
    });
    synced++;
  }
  return { synced, skipped: false };
}

async function priceForSymbol(pos: { symbol: string; assetType: string }) {
  if (pos.assetType === "crypto") {
    const cgId = CG_IDS[pos.symbol.replace("-USD", "").toUpperCase()];
    if (cgId) {
      const data = await cgPrice([cgId]);
      const p = data[cgId]?.usd;
      const chg = data[cgId]?.usd_24h_change;
      if (p) return { price: p, dayChangePct: chg != null ? chg / 100 : null };
    }
    if (pos.symbol === "USDT" || pos.symbol === "USDC" || pos.symbol === "BUSD" || pos.symbol === "FDUSD") {
      return { price: 1, dayChangePct: 0 };
    }
    // Last resort — try yfinance with -USD pair.
    const q = await getQuote(`${pos.symbol}-USD`);
    return { price: q?.price ?? null, dayChangePct: q?.changePct ?? null };
  }

  const q = await getQuote(pos.symbol);
  return { price: q?.price ?? null, dayChangePct: q?.changePct ?? null };
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const rows = await prisma.position.findMany({ orderBy: { createdAt: "asc" } });
  const priced: PositionRow[] = await Promise.all(
    rows.map(async (r) => {
      const { price, dayChangePct } = await priceForSymbol({ symbol: r.symbol, assetType: r.assetType }).catch(() => ({ price: null, dayChangePct: null }));
      const marketValue = price != null ? price * r.quantity : null;
      const costBasis = r.avgCost * r.quantity;
      const pnlAbs = marketValue != null ? marketValue - costBasis : null;
      const pnlPct = pnlAbs != null && costBasis > 0 ? pnlAbs / costBasis : null;
      return {
        id: r.id,
        source: r.source as PositionRow["source"],
        symbol: r.symbol,
        assetType: r.assetType as PositionRow["assetType"],
        quantity: r.quantity,
        avgCost: r.avgCost,
        currency: r.currency,
        sector: r.sector ?? null,
        geography: r.geography ?? null,
        price,
        marketValue,
        costBasis,
        pnlAbs,
        pnlPct,
        dayChangePct,
      };
    })
  );

  const totalValue = priced.reduce((a, p) => a + (p.marketValue ?? 0), 0);
  const totalCost = priced.reduce((a, p) => a + p.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? totalPnl / totalCost : 0;
  const dayPnl = priced.reduce((a, p) => a + (p.marketValue != null && p.dayChangePct != null ? p.marketValue * p.dayChangePct : 0), 0);
  const dayPnlPct = totalValue > 0 ? dayPnl / totalValue : 0;

  const byClass: Record<string, number> = {};
  const byGeography: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  for (const p of priced) {
    if (p.marketValue == null) continue;
    byClass[p.assetType] = (byClass[p.assetType] ?? 0) + p.marketValue;
    const geo = p.geography ?? "Otros";
    byGeography[geo] = (byGeography[geo] ?? 0) + p.marketValue;
    const sec = p.sector ?? "Otros";
    bySector[sec] = (bySector[sec] ?? 0) + p.marketValue;
  }

  return {
    positions: priced,
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPct,
    dayPnl,
    dayPnlPct,
    byClass,
    byGeography,
    bySector,
  };
}

// Parse the broker CSV template. Columns: symbol,quantity,avgCost,assetType,sector,geography,currency
export function parseBrokerCsv(text: string): Array<{
  symbol: string;
  quantity: number;
  avgCost: number;
  assetType: string;
  sector: string | null;
  geography: string | null;
  currency: string;
}> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const rows: Array<{ symbol: string; quantity: number; avgCost: number; assetType: string; sector: string | null; geography: string | null; currency: string }> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const symbol = cols[idx("symbol")];
    const quantity = Number(cols[idx("quantity")]);
    const avgCost = Number(cols[idx("avgcost")]);
    if (!symbol || !Number.isFinite(quantity) || !Number.isFinite(avgCost)) continue;
    const providedType = cols[idx("assettype")] ?? "";
    const resolved = resolveSymbol(symbol);
    const assetType = providedType || resolved.assetType;
    rows.push({
      symbol: resolved.symbol,
      quantity,
      avgCost,
      assetType,
      sector: cols[idx("sector")] || null,
      geography: cols[idx("geography")] || null,
      currency: cols[idx("currency")] || "USD",
    });
  }
  return rows;
}

export async function importBrokerPositions(rows: ReturnType<typeof parseBrokerCsv>) {
  let imported = 0;
  for (const r of rows) {
    await prisma.position.upsert({
      where: { source_symbol: { source: "broker-csv", symbol: r.symbol } },
      update: {
        quantity: r.quantity,
        avgCost: r.avgCost,
        assetType: r.assetType,
        sector: r.sector,
        geography: r.geography,
        currency: r.currency,
      },
      create: {
        source: "broker-csv",
        symbol: r.symbol,
        quantity: r.quantity,
        avgCost: r.avgCost,
        assetType: r.assetType,
        sector: r.sector,
        geography: r.geography,
        currency: r.currency,
      },
    });
    imported++;
  }
  return imported;
}

export async function savePortfolioSnapshot(summary: PortfolioSummary) {
  await prisma.portfolioSnapshot.create({
    data: {
      totalValue: summary.totalValue,
      pnlDay: summary.dayPnl,
      pnlTotal: summary.totalPnl,
      breakdown: JSON.stringify({ byClass: summary.byClass, byGeography: summary.byGeography, bySector: summary.bySector }),
    },
  });
}
