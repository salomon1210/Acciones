"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUI } from "@/lib/stores/ui";
import { BookOpen, Briefcase, LineChart, Bell, Sunrise, Newspaper } from "lucide-react";

const STEPS = [
  {
    icon: LineChart,
    title: "Bienvenido a Investment Command",
    body: "Es una mesa de análisis de inversiones pensada para que entiendas qué estás mirando, sin asumir que sos experto. Cada número importante tiene un ? al lado con una explicación en criollo.",
  },
  {
    icon: Briefcase,
    title: "Analizá cualquier activo",
    body: "Apretá Cmd/Ctrl + K en cualquier momento y escribí un ticker (AAPL, BTC-USD, SPY). Vas a ver 10 pestañas con fundamentales, técnicos, valuación, riesgos, moats, noticias, y un veredicto AI claro con 3 pros y 3 contras.",
  },
  {
    icon: Newspaper,
    title: "Noticias con sentiment",
    body: "En la sección Noticias ves en tiempo real lo que está pasando, cada una clasificada como positiva / neutra / negativa, y con un resumen de una línea para que no tengas que leer todo.",
  },
  {
    icon: Bell,
    title: "Alertas y briefing diario",
    body: "Configurá alertas (precio cruza X, RSI bajo 30, noticia negativa) y recibí cada mañana un briefing AI con lo importante del día para tus activos.",
  },
  {
    icon: BookOpen,
    title: "Disclaimer importante",
    body: "Esta app es una herramienta educativa y de análisis personal. No es asesoramiento financiero. Las inversiones pueden perder valor. Usá esta información como un insumo más, no como una recomendación.",
  },
];

export function OnboardingTour() {
  const { onboardingSeen, markOnboardingSeen } = useUI();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const open = !onboardingSeen;
  const Icon = STEPS[step].icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) markOnboardingSeen();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md border border-border bg-surface-2 flex items-center justify-center">
              <Icon className="h-4 w-4 text-fg" />
            </div>
            <DialogTitle>{STEPS[step].title}</DialogTitle>
          </div>
          <DialogDescription>{STEPS[step].body}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 pt-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                i === step
                  ? "h-1.5 w-6 rounded-full bg-fg"
                  : "h-1.5 w-1.5 rounded-full bg-border"
              }
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => markOnboardingSeen()}>
            Saltar
          </Button>
          {step > 0 && (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button size="sm" onClick={() => markOnboardingSeen()}>
              Empezar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
