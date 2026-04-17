// Seed the local SQLite DB with a demo watchlist so a fresh install has
// something interesting on the dashboard even before the user adds tickers.
// Run via `npm run seed`.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WATCHLIST: Array<{ symbol: string; assetType: string }> = [
  { symbol: "AAPL", assetType: "equity" },
  { symbol: "MSFT", assetType: "equity" },
  { symbol: "NVDA", assetType: "equity" },
  { symbol: "GOOGL", assetType: "equity" },
  { symbol: "META", assetType: "equity" },
  { symbol: "TSLA", assetType: "equity" },
  { symbol: "BRK-B", assetType: "equity" },
  { symbol: "SPY", assetType: "etf" },
  { symbol: "QQQ", assetType: "etf" },
  { symbol: "BTC-USD", assetType: "crypto" },
];

async function main() {
  for (const item of WATCHLIST) {
    await prisma.watchlist.upsert({
      where: { symbol: item.symbol },
      update: { assetType: item.assetType },
      create: item,
    });
  }
  const count = await prisma.watchlist.count();
  // eslint-disable-next-line no-console
  console.log(`Seeded watchlist: ${count} tickers`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
