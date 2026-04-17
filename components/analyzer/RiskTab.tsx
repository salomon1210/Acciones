import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { MetricTile } from "@/components/analyzer/MetricTile";
import { formatNumber, formatPercent, classifyRatio } from "@/lib/utils/format";
import type { PyCandle } from "@/lib/api/py";
import { annualizedVol, maxDrawdown, sharpeRatio, sortinoRatio } from "@/lib/analysis/risk";

function volLabel(vol: number | null): ReturnType<typeof classifyRatio> {
  if (vol == null) return null;
  const pct = vol * 100;
  if (pct <= 15) return "barato";
  if (pct <= 25) return "razonable";
  if (pct <= 40) return "caro";
  return "muy caro";
}

function sharpeLabel(s: number | null): ReturnType<typeof classifyRatio> {
  if (s == null) return null;
  if (s >= 1.5) return "barato";
  if (s >= 1) return "razonable";
  if (s >= 0.5) return "caro";
  return "muy caro";
}

export function RiskTab({
  candles,
  beta,
}: {
  candles: PyCandle[];
  beta: number | null;
}) {
  const vol = annualizedVol(candles);
  const dd = maxDrawdown(candles);
  const sharpe = sharpeRatio(candles);
  const sortino = sortinoRatio(candles);

  return (
    <div className="space-y-4">
      <Criollo>
        &quot;Riesgo&quot; acá significa cuánto se mueve el precio (volatilidad), cuánto puede caer en el peor escenario (drawdown) y cuánta ganancia te da por unidad de ese riesgo.
      </Criollo>

      <Card>
        <CardHeader><CardTitle>Métricas de riesgo (1 año)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <MetricTile
            label="Volatilidad anual"
            value={formatPercent(vol, { scale: "unit" })}
            assessment={volLabel(vol)}
            hint="Desvío estándar de los retornos diarios × √252"
          />
          <MetricTile
            label="Máx. drawdown"
            term="maxdrawdown"
            value={formatPercent(dd, { scale: "unit" })}
          />
          <MetricTile
            label="Sharpe ratio"
            term="sharpe"
            value={formatNumber(sharpe, { decimals: 2 })}
            assessment={sharpeLabel(sharpe)}
          />
          <MetricTile
            label="Sortino ratio"
            term="sortino"
            value={formatNumber(sortino, { decimals: 2 })}
          />
          <MetricTile
            label="Beta"
            term="beta"
            value={formatNumber(beta, { decimals: 2 })}
            hint={beta != null ? (beta > 1.2 ? "Más volátil que el mercado" : beta < 0.8 ? "Más defensiva que el mercado" : "Similar al mercado") : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cómo leerlo</CardTitle></CardHeader>
        <CardContent className="text-xs text-fg-dim space-y-2">
          <p>
            <span className="text-fg font-medium">Volatilidad</span>: si ves 30% anual, esperá movimientos típicos ±30% en un año.
            Menos de 15% es defensivo, más de 40% es muy volátil.
          </p>
          <p>
            <span className="text-fg font-medium">Max Drawdown</span>: lo peor que cayó desde un pico. -50% significa que en algún momento valió la mitad.
          </p>
          <p>
            <span className="text-fg font-medium">Sharpe</span>: rendimiento por unidad de riesgo total. &gt;1 es bueno, &gt;1.5 excelente.
            El Sortino es similar pero solo penaliza los desvíos a la baja.
          </p>
          <p>
            <span className="text-fg font-medium">Beta</span>: relación con el mercado. Beta=1 se mueve igual que el índice, 1.5 amplifica 50%, 0.5 modera.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
