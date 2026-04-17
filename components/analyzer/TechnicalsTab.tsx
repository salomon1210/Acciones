import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { MetricTile } from "@/components/analyzer/MetricTile";
import { TradingViewWidget } from "@/components/charts/TradingViewWidget";
import { formatNumber, formatPercent, classifyRatio } from "@/lib/utils/format";

type IndicatorSnapshot = {
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  bbUpper: number | null;
  bbLower: number | null;
  atr14: number | null;
  adx14: number | null;
  volRel: number | null;
  pattern: string | null;
  support: number | null;
  resistance: number | null;
  latestClose: number | null;
};

function rsiLabel(rsi: number | null): ReturnType<typeof classifyRatio> {
  if (rsi == null) return null;
  if (rsi <= 30) return "barato";
  if (rsi <= 60) return "razonable";
  if (rsi <= 75) return "caro";
  return "muy caro";
}

export function TechnicalsTab({
  symbol,
  indicators,
}: {
  symbol: string;
  indicators: IndicatorSnapshot | null;
}) {
  const trend = indicators && indicators.ema20 != null && indicators.ema50 != null && indicators.ema200 != null
    ? indicators.ema20 > indicators.ema50 && indicators.ema50 > indicators.ema200
      ? "alcista"
      : indicators.ema20 < indicators.ema50 && indicators.ema50 < indicators.ema200
        ? "bajista"
        : "mixta"
    : null;

  return (
    <div className="space-y-4">
      <Criollo>
        Esta es la foto técnica: cómo se está moviendo el precio, si los indicadores de corto plazo están fuertes, y cuánto aguante tiene la tendencia.
      </Criollo>

      <Card>
        <CardHeader><CardTitle>Chart profesional</CardTitle></CardHeader>
        <CardContent className="p-0 h-[420px]">
          <TradingViewWidget symbol={symbol} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Indicadores clave</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <MetricTile
            label="RSI (14)"
            term="rsi"
            value={formatNumber(indicators?.rsi14 ?? null, { decimals: 1 })}
            assessment={rsiLabel(indicators?.rsi14 ?? null)}
          />
          <MetricTile
            label="MACD"
            term="macd"
            value={formatNumber(indicators?.macd ?? null, { decimals: 2 })}
            hint={indicators?.macdHist != null ? `Hist ${formatNumber(indicators.macdHist, { decimals: 2 })}` : undefined}
          />
          <MetricTile
            label="EMA 20"
            term="ema"
            value={formatNumber(indicators?.ema20 ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="EMA 50"
            term="ema"
            value={formatNumber(indicators?.ema50 ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="EMA 200"
            term="ema"
            value={formatNumber(indicators?.ema200 ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="Bollinger Sup."
            term="bollinger"
            value={formatNumber(indicators?.bbUpper ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="Bollinger Inf."
            term="bollinger"
            value={formatNumber(indicators?.bbLower ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="ATR (14)"
            term="atr"
            value={formatNumber(indicators?.atr14 ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="ADX"
            term="adx"
            value={formatNumber(indicators?.adx14 ?? null, { decimals: 1 })}
          />
          <MetricTile
            label="Vol. relativa"
            value={formatPercent(indicators?.volRel ?? null, { scale: "unit" })}
            hint="Respecto al promedio de 20 días"
          />
          <MetricTile
            label="Soporte"
            term="support"
            value={formatNumber(indicators?.support ?? null, { decimals: 2 })}
          />
          <MetricTile
            label="Resistencia"
            term="resistance"
            value={formatNumber(indicators?.resistance ?? null, { decimals: 2 })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lectura rápida</CardTitle></CardHeader>
        <CardContent className="text-xs text-fg-dim space-y-2">
          {trend && (
            <p>
              Tendencia general: <span className="text-fg font-medium">{trend}</span>.
              {trend === "alcista" && " Las medias móviles apiladas arriba suelen acompañar mercados con impulso comprador."}
              {trend === "bajista" && " Medias móviles invertidas suelen indicar presión vendedora sostenida."}
              {trend === "mixta" && " Señales cruzadas: conviene esperar confirmación antes de operar."}
            </p>
          )}
          {indicators?.pattern && (
            <p>
              Patrón detectado: <span className="text-fg font-medium">{indicators.pattern}</span>.
            </p>
          )}
          {indicators?.rsi14 != null && indicators.rsi14 > 70 && (
            <p>RSI en zona de sobrecompra ({indicators.rsi14.toFixed(1)}). Puede haber toma de ganancias.</p>
          )}
          {indicators?.rsi14 != null && indicators.rsi14 < 30 && (
            <p>RSI en zona de sobreventa ({indicators.rsi14.toFixed(1)}). Puede haber rebote técnico.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
