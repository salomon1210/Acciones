import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyzerHeader } from "@/components/analyzer/Header";
import { OverviewTab } from "@/components/analyzer/OverviewTab";
import { FundamentalsTab } from "@/components/analyzer/FundamentalsTab";
import { TechnicalsTab } from "@/components/analyzer/TechnicalsTab";
import { ValuationTab } from "@/components/analyzer/ValuationTab";
import { RiskTab } from "@/components/analyzer/RiskTab";
import { MoatsTab } from "@/components/analyzer/MoatsTab";
import { CatalystsTab } from "@/components/analyzer/CatalystsTab";
import { PeersTab, type PeerRow } from "@/components/analyzer/PeersTab";
import { NewsTab, type TickerNewsItem } from "@/components/analyzer/NewsTab";
import { AIVerdict } from "@/components/analyzer/AIVerdict";
import { PreTradeChecklist } from "@/components/analyzer/PreTradeChecklist";
import { getQuote, getFundamentals, getHistorical, getStatements } from "@/lib/api/unified";
import { pyIndicators, pyFundamentals } from "@/lib/api/py";
import { finnhubCompanyNews, finnhubEarningsCalendar, finnhubInsiderTransactions } from "@/lib/api/finnhub";
import { fmpPeers } from "@/lib/api/fmp";
import { edgarRecentFilings } from "@/lib/api/edgar";
import { resolveSymbol } from "@/lib/api/resolver";
import { formatTicker } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: raw } = await params;
  const ticker = formatTicker(raw);
  if (!ticker) return notFound();

  const { assetType } = resolveSymbol(ticker);

  const [quote, fundamentals, historical, statements, news, marketHist] = await Promise.all([
    getQuote(ticker).catch(() => null),
    getFundamentals(ticker).catch(() => null),
    getHistorical(ticker, "1y", "1d").catch(() => null),
    getStatements(ticker).catch(() => ({ income: [], balance: [], cashflow: [] })),
    finnhubCompanyNews(ticker, 14).catch(() => []),
    getHistorical("SPY", "1y", "1d").catch(() => null),
  ]);

  // Technical indicators from Python backend
  const indicatorsResp = historical?.candles?.length
    ? await pyIndicators(historical.candles).catch(() => null)
    : null;

  const latestIndicators = indicatorsResp?.points?.[indicatorsResp.points.length - 1] ?? null;
  const indicatorSnapshot = indicatorsResp
    ? {
        rsi14: latestIndicators?.rsi14 ?? null,
        macd: latestIndicators?.macd ?? null,
        macdSignal: latestIndicators?.macdSignal ?? null,
        macdHist: latestIndicators?.macdHist ?? null,
        ema20: latestIndicators?.ema20 ?? null,
        ema50: latestIndicators?.ema50 ?? null,
        ema200: latestIndicators?.ema200 ?? null,
        bbUpper: latestIndicators?.bbUpper ?? null,
        bbLower: latestIndicators?.bbLower ?? null,
        atr14: latestIndicators?.atr14 ?? null,
        adx14: latestIndicators?.adx14 ?? null,
        volRel: latestIndicators?.volRel ?? null,
        pattern: indicatorsResp.snapshot.pattern,
        support: indicatorsResp.snapshot.support,
        resistance: indicatorsResp.snapshot.resistance,
        latestClose: indicatorsResp.snapshot.latestClose,
      }
    : null;

  // Beta vs SPY (daily returns correlation). Fundamentals beta is a fallback.
  let betaValue: number | null = fundamentals?.beta ?? null;
  if (historical?.candles && marketHist?.candles && historical.candles.length > 30 && marketHist.candles.length > 30) {
    const assetReturns = dailyReturns(historical.candles.map((c) => c.c));
    const marketReturns = dailyReturns(marketHist.candles.map((c) => c.c));
    const n = Math.min(assetReturns.length, marketReturns.length);
    const a = assetReturns.slice(-n);
    const m = marketReturns.slice(-n);
    betaValue = calcBeta(a, m) ?? betaValue;
  }

  const sparkData = historical?.candles?.slice(-60).map((c) => c.c) ?? [];

  // Peers from FMP — fetch fundamentals for up to 5 peers in parallel.
  const peerSymbols = await fmpPeers(ticker).catch(() => []);
  const peerFundamentalsArr = peerSymbols.length
    ? await Promise.all(peerSymbols.slice(0, 5).map((s) => pyFundamentals(s).catch(() => null)))
    : [];
  const peerRows: PeerRow[] = peerFundamentalsArr.flatMap((pf) => {
    if (!pf) return [];
    const row: PeerRow = {
      symbol: pf.symbol,
      name: pf.name ?? null,
      price: null,
      marketCap: pf.marketCap ?? null,
      peRatio: pf.peRatio ?? null,
      pbRatio: pf.pbRatio ?? null,
      psRatio: pf.psRatio ?? null,
      evEbitda: pf.evEbitda ?? null,
      grossMargin: pf.grossMargin ?? null,
      returnOnEquity: pf.returnOnEquity ?? null,
    };
    return [row];
  });

  const currentRow: PeerRow = {
    symbol: ticker,
    name: fundamentals?.name ?? null,
    price: quote?.price ?? null,
    marketCap: fundamentals?.marketCap ?? null,
    peRatio: fundamentals?.peRatio ?? null,
    pbRatio: fundamentals?.pbRatio ?? null,
    psRatio: fundamentals?.psRatio ?? null,
    evEbitda: fundamentals?.evEbitda ?? null,
    grossMargin: fundamentals?.grossMargin ?? null,
    returnOnEquity: fundamentals?.returnOnEquity ?? null,
  };

  // Catalysts
  const [earnings, insiders, filings] = await Promise.all([
    finnhubEarningsCalendar(
      new Date(Date.now() - 365 * 86400_000),
      new Date(Date.now() + 180 * 86400_000),
      ticker
    ).catch(() => []),
    finnhubInsiderTransactions(ticker).catch(() => []),
    assetType === "equity" ? edgarRecentFilings(ticker).catch(() => []) : Promise.resolve([]),
  ]);

  const newsItems: TickerNewsItem[] = news.map((n) => ({
    headline: n.headline,
    url: n.url,
    source: n.source,
    summary: n.summary,
    datetime: n.datetime,
    sentiment: null, // Populated in Fase 4 via Haiku.
  }));

  return (
    <div className="space-y-4">
      <AnalyzerHeader
        symbol={ticker}
        assetType={assetType}
        quote={quote}
        fundamentals={fundamentals}
        sparkData={sparkData}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="technicals">Técnico</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="risk">Riesgo</TabsTrigger>
          <TabsTrigger value="moats">Moats</TabsTrigger>
          <TabsTrigger value="catalysts">Catalizadores</TabsTrigger>
          <TabsTrigger value="peers">Peers</TabsTrigger>
          <TabsTrigger value="news">Noticias</TabsTrigger>
          <TabsTrigger value="verdict">Veredicto</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab fundamentals={fundamentals} />
        </TabsContent>
        <TabsContent value="fundamentals">
          <FundamentalsTab fundamentals={fundamentals} statements={statements} />
        </TabsContent>
        <TabsContent value="technicals">
          <TechnicalsTab symbol={ticker} indicators={indicatorSnapshot} />
        </TabsContent>
        <TabsContent value="valuation">
          <ValuationTab
            symbol={ticker}
            fundamentals={fundamentals}
            currentPrice={quote?.price ?? null}
            analystTargetMean={fundamentals?.targetMeanPrice ?? null}
            analystTargetHigh={fundamentals?.targetHighPrice ?? null}
            analystTargetLow={fundamentals?.targetLowPrice ?? null}
          />
        </TabsContent>
        <TabsContent value="risk">
          <RiskTab candles={historical?.candles ?? []} beta={betaValue} />
        </TabsContent>
        <TabsContent value="moats">
          <MoatsTab fundamentals={fundamentals} />
        </TabsContent>
        <TabsContent value="catalysts">
          <CatalystsTab earnings={earnings} insiders={insiders} filings={filings} />
        </TabsContent>
        <TabsContent value="peers">
          <PeersTab current={currentRow} peers={peerRows} />
        </TabsContent>
        <TabsContent value="news">
          <NewsTab news={newsItems} />
        </TabsContent>
        <TabsContent value="verdict">
          <AIVerdict symbol={ticker} fundamentals={fundamentals} />
        </TabsContent>
        <TabsContent value="checklist">
          <PreTradeChecklist symbol={ticker} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function dailyReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const p = closes[i - 1];
    if (p > 0) out.push((closes[i] - p) / p);
  }
  return out;
}

function calcBeta(asset: number[], market: number[]): number | null {
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
