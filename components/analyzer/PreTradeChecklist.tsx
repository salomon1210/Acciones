"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  label: string;
  why: string;
};

const ITEMS: ChecklistItem[] = [
  {
    id: "thesis",
    label: "Tengo una tesis clara en 1 o 2 frases",
    why: "Si no podés explicar por qué la comprás en una frase, probablemente no la entiendas. La tesis te ancla cuando el precio se mueve.",
  },
  {
    id: "horizon",
    label: "Definí el horizonte temporal (semanas, meses, años)",
    why: "Una acción que baja 20% es un drama si operás con horizonte de 1 semana, y un descuento si operás a 5 años.",
  },
  {
    id: "sizing",
    label: "Sé cuánto del portfolio voy a asignar y por qué",
    why: "Una posición del 20% necesita convicción; una del 2% puede ser una apuesta asimétrica. No improvises con el tamaño.",
  },
  {
    id: "stop",
    label: "Tengo un plan si el precio va en contra (stop / nivel de revisión)",
    why: "No es solo un stop-loss técnico. Es un nivel en el que vas a reevaluar si la tesis sigue vigente.",
  },
  {
    id: "target",
    label: "Sé a qué precio / evento me gustaría vender",
    why: "Vender es 90% del juego. Si no pensaste la salida, vas a vender en pánico o sostener demasiado.",
  },
  {
    id: "valuation",
    label: "Entendí si está cara, razonable o barata vs su historia",
    why: "Pagar caro por algo bueno puede ser pésima inversión. Pagar barato por algo mediocre, también. El precio siempre importa.",
  },
  {
    id: "risks",
    label: "Listé los 3 riesgos principales",
    why: "Todo negocio puede fallar por varios motivos. Anotarlos te obliga a enfrentarlos y a fijar umbrales concretos de alerta.",
  },
  {
    id: "catalyst",
    label: "Identifiqué un catalizador creíble en los próximos 6-12 meses",
    why: "Sin catalizador, el mercado puede ignorar una buena empresa durante años. ¿Qué hace que el precio reaccione?",
  },
  {
    id: "emotion",
    label: "No estoy operando por FOMO o por vendetta con una posición anterior",
    why: "Las peores decisiones vienen de emociones, no de análisis. Si lo que te empuja es miedo o venganza, parar.",
  },
  {
    id: "diversification",
    label: "Esta posición no descompensa mi diversificación por sector o país",
    why: "Aunque ames la tesis, si ya tenés 40% en tecnología, sumar más concentra un riesgo que puede dolerte en el peor momento.",
  },
];

export function PreTradeChecklist({ symbol }: { symbol: string }) {
  const storageKey = `ptc:${symbol}`;
  const [state, setState] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, storageKey, hydrated]);

  function toggle(id: string) {
    setState((s) => ({ ...s, [id]: !s[id] }));
  }

  const checked = ITEMS.filter((i) => state[i.id]).length;
  const total = ITEMS.length;

  return (
    <div className="space-y-4">
      <Criollo>
        Antes de apretar el botón de comprar, corré esta checklist. No es un formulario: es un freno a las decisiones apuradas.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pre-Trade Checklist</span>
            <span className="text-xs text-fg-dim num">{checked} / {total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-pos rounded-full transition-all"
              style={{ width: `${(checked / total) * 100}%` }}
            />
          </div>

          {ITEMS.map((item) => {
            const isChecked = !!state[item.id];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="border border-border rounded-md">
                <div className="flex items-center gap-3 p-2.5">
                  <button
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      isChecked ? "bg-pos border-pos" : "border-border hover:border-fg-dim"
                    )}
                    aria-label={isChecked ? "Desmarcar" : "Marcar"}
                  >
                    {isChecked && <Check className="w-3 h-3 text-bg" />}
                  </button>
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="flex-1 flex items-center justify-between text-left text-xs text-fg hover:text-fg"
                  >
                    <span className={cn("leading-snug", isChecked && "line-through text-fg-dim")}>
                      {item.label}
                    </span>
                    {isOpen ? <ChevronUp className="w-3 h-3 text-fg-dim" /> : <ChevronDown className="w-3 h-3 text-fg-dim" />}
                  </button>
                </div>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-border bg-surface-2/30">
                    <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">¿Por qué importa?</div>
                    <p className="text-[11px] text-fg-dim leading-relaxed">{item.why}</p>
                  </div>
                )}
              </div>
            );
          })}

          {checked < total && (
            <div className="text-[10px] text-warn mt-3 text-center">
              Te faltan {total - checked} ítem{total - checked === 1 ? "" : "s"} para ejecutar con cabeza fría.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
