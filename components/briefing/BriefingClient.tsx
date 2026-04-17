"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Sunrise, Trash2 } from "lucide-react";
import { Markdown } from "@/components/briefing/Markdown";
import { relativeTime } from "@/lib/utils/format";

type BriefingRow = {
  id: number;
  date: string;
  markdown: string;
  metadata: string;
};

export function BriefingClient({ initial }: { initial: BriefingRow[] }) {
  const [briefings, setBriefings] = useState<BriefingRow[]>(initial);
  const [selectedId, setSelectedId] = useState<number | null>(initial[0]?.id ?? null);
  const [generating, setGenerating] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetch("/api/briefing");
    if (!res.ok) return;
    const data = (await res.json()) as { briefings: BriefingRow[] };
    setBriefings(data.briefings);
    if (data.briefings[0] && selectedId == null) setSelectedId(data.briefings[0].id);
  }, [selectedId]);

  useEffect(() => {
    if (initial.length === 0) reload();
  }, [initial.length, reload]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/briefing/generate", { method: "POST" });
      if (!res.ok) {
        toast.error("No pude generar el briefing.");
      } else {
        const data = await res.json();
        toast.success("Briefing generado.");
        setSelectedId(data.briefing.id);
        await reload();
      }
    } finally {
      setGenerating(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/briefing?id=${id}`, { method: "DELETE" });
    toast.success("Briefing eliminado.");
    if (selectedId === id) setSelectedId(null);
    await reload();
  }

  const selected = briefings.find((b) => b.id === selectedId) ?? briefings[0] ?? null;

  return (
    <div className="space-y-4">
      <Criollo>
        El briefing diario es un resumen del mercado, de tu portfolio, de las noticias más importantes y de los earnings del día. Si cargás tu ANTHROPIC_API_KEY, lo escribe Claude; si no, armamos una versión heurística. Se genera automáticamente a las 08:30 local.
      </Criollo>

      <Card>
        <CardContent className="p-3 flex items-center gap-2">
          <Button size="sm" onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sunrise className="w-3.5 h-3.5 mr-1" />}
            Generar ahora
          </Button>
          <Badge variant="outline" className="ml-auto text-[10px]">{briefings.length} en historial</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        <Card>
          <CardContent className="p-2">
            <div className="text-[10px] uppercase tracking-wider text-fg-muted px-1 pb-2">Historial</div>
            {briefings.length === 0 ? (
              <p className="text-[11px] text-fg-dim px-1 py-2">Todavía no hay briefings. Generá el primero.</p>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {briefings.map((b) => {
                  const active = b.id === selected?.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                        active ? "bg-surface-2 text-fg" : "text-fg-dim hover:bg-surface-2/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{new Date(b.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
                        <span className="text-[9px] text-fg-muted">hace {relativeTime(b.date)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {selected ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] text-fg-muted">
                    {new Date(selected.date).toLocaleString("es-AR", { dateStyle: "full", timeStyle: "short" })}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(selected.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-neg" />
                  </Button>
                </div>
                <Markdown source={selected.markdown} />
              </div>
            ) : (
              <p className="text-xs text-fg-dim py-10 text-center">Seleccioná un briefing del historial o generá uno nuevo.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
