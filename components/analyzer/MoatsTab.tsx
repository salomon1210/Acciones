import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo, Explain } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import type { UnifiedFundamentals } from "@/lib/api/unified";

type Moat = {
  term: string;
  name: string;
  score: number; // 0-5
  rationale: string;
};

// Heuristic moat scoring based on margins / ROE / scale. Claude will refine
// this in Phase 6 with a qualitative read of filings and competitive dynamics.
function scoreMoats(f: UnifiedFundamentals | null): Moat[] {
  if (!f) return [];
  const gross = (f.grossMargin ?? 0) * 100;
  const op = (f.operatingMargin ?? 0) * 100;
  const roe = (f.returnOnEquity ?? 0) * 100;
  const cap = f.marketCap ?? 0;

  const intangibles = clamp((gross - 40) / 10 + (op - 15) / 10, 0, 5);
  const network = clamp((cap > 5e11 ? 3 : cap > 1e11 ? 2 : cap > 1e10 ? 1 : 0) + (op - 20) / 15, 0, 5);
  const cost = clamp((op - 10) / 8 + (gross > 50 ? 1 : 0), 0, 5);
  const switching = clamp((roe - 15) / 8 + (gross - 60) / 20, 0, 5);

  return [
    { term: "moatIntangibles", name: "Marca / Intangibles", score: round1(intangibles), rationale: "Márgenes brutos altos suelen indicar pricing power — marca, patentes o regulaciones que frenan a los competidores." },
    { term: "moatNetwork", name: "Efecto red / Escala", score: round1(network), rationale: "Se gana con tamaño: más usuarios hacen el producto más valioso, o los costos fijos se diluyen en más ventas." },
    { term: "moatCost", name: "Ventaja de costos", score: round1(cost), rationale: "Producir más barato que los rivales — por logística, materia prima, tecnología o escala." },
    { term: "moatSwitching", name: "Costos de cambio", score: round1(switching), rationale: "Al cliente le cuesta tiempo, dinero o riesgo moverse a la competencia. Se refleja en retención y márgenes altos sostenidos." },
  ];
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function round1(v: number) {
  return Math.round(v * 10) / 10;
}

function moatBadge(score: number) {
  if (score >= 4) return { variant: "pos" as const, text: "ancho" };
  if (score >= 2.5) return { variant: "info" as const, text: "medio" };
  if (score >= 1) return { variant: "warn" as const, text: "angosto" };
  return { variant: "neg" as const, text: "sin moat" };
}

export function MoatsTab({ fundamentals }: { fundamentals: UnifiedFundamentals | null }) {
  const moats = scoreMoats(fundamentals);
  const total = moats.reduce((a, m) => a + m.score, 0);
  const avg = moats.length ? total / moats.length : 0;

  return (
    <div className="space-y-4">
      <Criollo>
        Los <Explain term="moat">moats</Explain> son las ventajas competitivas duraderas: lo que hace difícil que otro copie el negocio. Empresas con moat ancho suelen sostener márgenes altos por décadas.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Score de moats (0-5)</span>
            <Badge variant={moatBadge(avg).variant}>{moatBadge(avg).text}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moats.map((m) => (
            <div key={m.term} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-fg">
                  <Explain term={m.term}>{m.name}</Explain>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-sm text-fg">{m.score.toFixed(1)}</span>
                  <Badge variant={moatBadge(m.score).variant}>{moatBadge(m.score).text}</Badge>
                </div>
              </div>
              <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-pos rounded-full"
                  style={{ width: `${(m.score / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-fg-dim mt-2 leading-relaxed">{m.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nota</CardTitle></CardHeader>
        <CardContent className="text-xs text-fg-dim leading-relaxed">
          Este score actual es heurístico — mira márgenes, ROE y escala. En la Fase 6 Claude complementa con análisis cualitativo de filings y competencia para refinar cada dimensión.
        </CardContent>
      </Card>
    </div>
  );
}
