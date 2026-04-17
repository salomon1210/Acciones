import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { MetricTile } from "@/components/analyzer/MetricTile";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { assessPE, assessPB, assessPS, assessEvEbitda } from "@/lib/analysis/fundamentals";
import type { UnifiedFundamentals } from "@/lib/api/unified";

export function OverviewTab({ fundamentals }: { fundamentals: UnifiedFundamentals | null }) {
  if (!fundamentals) {
    return <EmptyOverview />;
  }

  const pe = assessPE(fundamentals.peRatio ?? null);
  const pb = assessPB(fundamentals.pbRatio ?? null);
  const ps = assessPS(fundamentals.psRatio ?? null);
  const evEbitda = assessEvEbitda(fundamentals.evEbitda ?? null);

  return (
    <div className="space-y-4">
      <Criollo>
        Resumen rápido: qué hace la empresa, cuánto vale, y si sus ratios más miradas (P/E, P/B, P/S, EV/EBITDA) están baratas, razonables o caras.
      </Criollo>

      {fundamentals.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Sobre el negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-fg-dim leading-relaxed">{fundamentals.summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Métricas clave</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <MetricTile
            label="P/E"
            term="pe"
            value={formatNumber(pe.value, { decimals: 1 })}
            assessment={pe.label}
          />
          <MetricTile
            label="Forward P/E"
            term="forwardpe"
            value={formatNumber(fundamentals.forwardPE, { decimals: 1 })}
          />
          <MetricTile
            label="P/B"
            term="pb"
            value={formatNumber(pb.value, { decimals: 2 })}
            assessment={pb.label}
          />
          <MetricTile
            label="P/S"
            term="ps"
            value={formatNumber(ps.value, { decimals: 2 })}
            assessment={ps.label}
          />
          <MetricTile
            label="EV/EBITDA"
            term="evebitda"
            value={formatNumber(evEbitda.value, { decimals: 1 })}
            assessment={evEbitda.label}
          />
          <MetricTile
            label="Div Yield"
            term="dividendyield"
            value={formatPercent(fundamentals.dividendYield, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Payout"
            term="payoutratio"
            value={formatPercent(fundamentals.payoutRatio, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Beta"
            term="beta"
            value={formatNumber(fundamentals.beta, { decimals: 2 })}
          />
          <MetricTile
            label="Short Float"
            term="shortinterest"
            value={formatPercent(fundamentals.shortFloat, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Insider Own."
            term="insiderTrading"
            value={formatPercent(fundamentals.insiderOwnership, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Institutional"
            term="institutional"
            value={formatPercent(fundamentals.institutionalOwnership, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="52W High"
            value={formatNumber(fundamentals.fiftyTwoWeekHigh, { decimals: 2 })}
          />
          <MetricTile
            label="52W Low"
            value={formatNumber(fundamentals.fiftyTwoWeekLow, { decimals: 2 })}
          />
          <MetricTile
            label="Shares Out."
            value={formatNumber(fundamentals.sharesOutstanding, { decimals: 2, compact: true })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyOverview() {
  return (
    <Card>
      <CardContent className="p-6 text-center text-xs text-fg-dim">
        No conseguí datos fundamentales para este ticker. Probá otro o cargá una API key.
      </CardContent>
    </Card>
  );
}
