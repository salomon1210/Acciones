"use client";

import { Card } from "@/components/ui/card";
import { formatNumber, formatPercent, signClass } from "@/lib/utils/format";
import { Explain } from "@/components/ui/explain";

type Index = {
  symbol: string;
  label: string;
  value: number;
  changePct: number;
  explain?: keyof typeof import("@/lib/glossary").GLOSSARY | string;
};

const MOCK_INDICES: Index[] = [
  { symbol: "SPX", label: "S&P 500", value: 5742.12, changePct: 0.0041 },
  { symbol: "NDX", label: "NASDAQ 100", value: 20145.88, changePct: 0.0072 },
  { symbol: "DJI", label: "Dow Jones", value: 42310.56, changePct: -0.0012 },
  { symbol: "BTC", label: "Bitcoin", value: 67834.2, changePct: 0.0185 },
  { symbol: "GOLD", label: "Oro (oz)", value: 2651.3, changePct: 0.0032 },
  { symbol: "DXY", label: "DXY", value: 104.21, changePct: -0.0019, explain: "dxy" },
  { symbol: "UST10Y", label: "UST 10Y", value: 4.02, changePct: 0.0045, explain: "yieldcurve" },
  { symbol: "VIX", label: "VIX", value: 16.4, changePct: -0.0284, explain: "vix" },
];

export function IndicesBar() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      {MOCK_INDICES.map((idx) => (
        <Card key={idx.symbol} className="p-3">
          <div className="text-[10px] uppercase tracking-wider text-fg-dim flex items-center justify-between">
            {idx.explain ? <Explain term={idx.explain}>{idx.label}</Explain> : idx.label}
          </div>
          <div className="num text-sm text-fg mt-1">{formatNumber(idx.value, { decimals: 2 })}</div>
          <div className={`num text-xs ${signClass(idx.changePct)}`}>
            {formatPercent(idx.changePct)}
          </div>
        </Card>
      ))}
    </div>
  );
}
