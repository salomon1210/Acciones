import { listGlossary, type GlossaryEntry } from "@/lib/glossary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: Record<GlossaryEntry["category"], string> = {
  concepto: "Conceptos básicos",
  fundamental: "Análisis fundamental",
  tecnico: "Análisis técnico",
  valuation: "Valuación",
  riesgo: "Riesgo",
  portfolio: "Portfolio",
  macro: "Macro",
  cripto: "Cripto",
};

export default function GlossaryPage() {
  const all = listGlossary();
  const grouped = all.reduce<Record<string, GlossaryEntry[]>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold">Glosario</h1>
        <p className="text-xs text-fg-dim mt-1 leading-relaxed">
          Todos los términos financieros que aparecen en la app, explicados en criollo. Cuando veas un término con un signo de pregunta, pasá el cursor por encima — la definición aparece ahí mismo.
        </p>
      </div>

      {Object.entries(CATEGORIES).map(([cat, label]) => {
        const entries = grouped[cat];
        if (!entries) return null;
        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {entries.map((e) => (
                <div key={e.term} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-fg">{e.label}</span>
                    <Badge variant="outline" className="text-[10px]">{cat}</Badge>
                  </div>
                  <p className="text-xs text-fg leading-snug">{e.short}</p>
                  {e.long && <p className="text-[11px] text-fg-dim leading-snug">{e.long}</p>}
                  {e.good && (
                    <p className="text-[11px] text-pos leading-snug">
                      <span className="text-fg-dim">Rango útil:</span> {e.good}
                    </p>
                  )}
                  {e.example && (
                    <p className="text-[11px] text-fg-dim italic leading-snug">Ej: {e.example}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
