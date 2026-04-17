import { Sparkline } from "@/components/charts/Sparkline";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatNumber, signClass } from "@/lib/utils/format";
import type { UnifiedQuote, UnifiedFundamentals } from "@/lib/api/unified";
import { prettyAssetType, type AssetType } from "@/lib/api/resolver";

type Props = {
  symbol: string;
  assetType: AssetType;
  quote: UnifiedQuote | null;
  fundamentals: UnifiedFundamentals | null;
  sparkData: number[];
};

export function AnalyzerHeader({ symbol, assetType, quote, fundamentals, sparkData }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-md border border-border bg-surface-2 flex items-center justify-center">
          <span className="ticker text-sm">{symbol.slice(0, 3)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="ticker text-xl text-fg">{symbol}</h1>
            <Badge variant="outline">{prettyAssetType(assetType)}</Badge>
            {quote?.source && quote.source !== "none" && (
              <Badge variant="default" className="text-[10px] uppercase">
                {quote.source}
              </Badge>
            )}
          </div>
          <div className="text-sm text-fg mt-0.5">{fundamentals?.name || "—"}</div>
          <div className="flex flex-wrap gap-2 text-[11px] text-fg-dim mt-1">
            {fundamentals?.sector && <span>{fundamentals.sector}</span>}
            {fundamentals?.industry && <span>· {fundamentals.industry}</span>}
            {fundamentals?.country && <span>· {fundamentals.country}</span>}
            {fundamentals?.exchange && <span>· {fundamentals.exchange}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="num text-2xl text-fg">
            {quote ? formatCurrency(quote.price, { currency: quote.currency }) : "—"}
          </div>
          {quote && (
            <div className={`num text-xs ${signClass(quote.changePct)}`}>
              {formatCurrency(quote.change, { currency: quote.currency })} ({formatPercent(quote.changePct)})
            </div>
          )}
          <div className="text-[10px] text-fg-muted mt-1">
            Mkt Cap {formatNumber(quote?.marketCap ?? fundamentals?.marketCap ?? null, { decimals: 2, compact: true })}
          </div>
        </div>
        <div className="w-32">
          <Sparkline data={sparkData} />
        </div>
      </div>
    </div>
  );
}
