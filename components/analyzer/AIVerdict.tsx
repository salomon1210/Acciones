"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { UnifiedFundamentals } from "@/lib/api/unified";

export type Verdict = "comprar" | "mantener" | "evitar";

export type VerdictPayload = {
  verdict: Verdict;
  confidence: number; // 0-1
  bull: string[];
  bear: string[];
  summary: string;
  aiPowered: boolean;
};

// Baseline heuristic verdict based on margins, growth, valuation.
// When ANTHROPIC_API_KEY is set, /api/analyze replaces this with Claude output.
function heuristicVerdict(f: UnifiedFundamentals | null): VerdictPayload {
  if (!f) {
    return {
      verdict: "mantener",
      confidence: 0.3,
      bull: [],
      bear: [],
      summary: "No conseguí suficiente data para dar un veredicto.",
      aiPowered: false,
    };
  }
  const pe = f.peRatio ?? 25;
  const roe = (f.returnOnEquity ?? 0) * 100;
  const grossMargin = (f.grossMargin ?? 0) * 100;
  const revGrowth = (f.revenueGrowth ?? 0) * 100;
  const debtEq = f.debtToEquity ?? 0;

  let score = 0;
  if (pe < 15) score += 2;
  else if (pe < 25) score += 1;
  else if (pe > 40) score -= 2;

  if (roe > 20) score += 2;
  else if (roe > 10) score += 1;
  else if (roe < 5) score -= 1;

  if (grossMargin > 40) score += 1;
  if (revGrowth > 10) score += 1;
  if (revGrowth < 0) score -= 1;
  if (debtEq > 200) score -= 1;

  const verdict: Verdict = score >= 3 ? "comprar" : score <= -2 ? "evitar" : "mantener";
  const bull: string[] = [];
  const bear: string[] = [];

  if (pe < 20) bull.push(`Cotiza a ${pe.toFixed(1)} veces ganancias, razonable vs el mercado amplio.`);
  if (roe > 15) bull.push(`Genera un ROE de ${roe.toFixed(0)}%, señal de negocio rentable y eficiente.`);
  if (grossMargin > 40) bull.push(`Margen bruto de ${grossMargin.toFixed(0)}% sugiere pricing power y ventajas competitivas.`);
  if (revGrowth > 10) bull.push(`Ventas creciendo al ${revGrowth.toFixed(1)}% anual.`);

  if (pe > 35) bear.push(`P/E de ${pe.toFixed(1)} ya descuenta mucho crecimiento futuro — hay poco margen de error.`);
  if (revGrowth < 0) bear.push(`Las ventas están cayendo (${revGrowth.toFixed(1)}%).`);
  if (debtEq > 200) bear.push("Deuda alta en relación al patrimonio — sensible a subas de tasa.");
  if (roe < 5) bear.push("ROE bajo sugiere que el capital invertido rinde poco.");

  while (bull.length < 3) bull.push("Datos fundamentales en línea con promedios del sector.");
  while (bear.length < 3) bear.push("Mercado en máximos: cualquier corrección amplia puede arrastrarla.");

  return {
    verdict,
    confidence: Math.min(1, Math.abs(score) / 5),
    bull: bull.slice(0, 3),
    bear: bear.slice(0, 3),
    summary: verdict === "comprar"
      ? "Los fundamentals sugieren que es una oportunidad con mejor relación riesgo/retorno que el promedio. Aún así, calibrá el tamaño de posición y tu horizonte."
      : verdict === "evitar"
        ? "Las métricas muestran señales de alerta. Mejor mirar desde afuera o esperar un mejor punto de entrada."
        : "El caso es mixto. Hay puntos positivos y negativos — conviene profundizar en el negocio específico antes de decidir.",
    aiPowered: false,
  };
}

export function AIVerdict({
  symbol,
  fundamentals,
}: {
  symbol: string;
  fundamentals: UnifiedFundamentals | null;
}) {
  const [payload, setPayload] = useState<VerdictPayload>(() => heuristicVerdict(fundamentals));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze/${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        if (res.status === 503) {
          setError("ANTHROPIC_API_KEY no está configurada. Mostrando veredicto heurístico.");
        } else {
          setError("No pude generar el análisis AI. Revisá el backend.");
        }
        return;
      }
      const data = (await res.json()) as VerdictPayload;
      setPayload(data);
    } catch {
      setError("Error conectando al servicio AI.");
    } finally {
      setLoading(false);
    }
  }

  const badge = payload.verdict === "comprar"
    ? { variant: "pos" as const, text: "Comprar" }
    : payload.verdict === "evitar"
      ? { variant: "neg" as const, text: "Evitar" }
      : { variant: "warn" as const, text: "Mantener" };

  return (
    <div className="space-y-4">
      <Criollo>
        El veredicto junta fundamentals, técnico, riesgo y catalizadores en una recomendación simple. <span className="text-fg">No es consejo financiero</span> — es una ayuda para pensar.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Veredicto AI</span>
              {payload.aiPowered && <Badge variant="info">Claude</Badge>}
            </div>
            <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
              {loading ? "Generando..." : "Regenerar con AI"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.text}</Badge>
            <div className="text-xs text-fg-dim">
              Confianza: <span className="text-fg num">{(payload.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {error && <div className="text-xs text-warn">{error}</div>}

          <p className="text-xs text-fg leading-relaxed">{payload.summary}</p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-pos mb-2">Puntos a favor</h4>
              <ul className="space-y-1.5 text-xs text-fg-dim">
                {payload.bull.map((b, i) => (
                  <li key={i} className="flex gap-2"><span className="text-pos">+</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-neg mb-2">Puntos en contra</h4>
              <ul className="space-y-1.5 text-xs text-fg-dim">
                {payload.bear.map((b, i) => (
                  <li key={i} className="flex gap-2"><span className="text-neg">−</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-fg-muted italic leading-relaxed pt-2 border-t border-border">
            Esto es una herramienta de análisis. No constituye asesoramiento financiero. Siempre validá con tu propio juicio y, si corresponde, con un asesor profesional.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
