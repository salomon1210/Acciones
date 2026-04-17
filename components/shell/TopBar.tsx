"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Activity } from "lucide-react";
import { useUI } from "@/lib/stores/ui";

function formatClock(d: Date): string {
  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function marketStatus(now: Date): { label: string; tone: "pos" | "warn" | "dim" } {
  // NYSE/NASDAQ: Mon-Fri, 09:30-16:00 ET (ET = UTC-4 in summer, UTC-5 in winter; use UTC-4 as default)
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const etHour = (utcHour - 4 + 24) % 24;
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return { label: "Mercado cerrado (fin de semana)", tone: "dim" };
  if (etHour >= 9.5 && etHour < 16) return { label: "US abierto", tone: "pos" };
  if ((etHour >= 4 && etHour < 9.5) || (etHour >= 16 && etHour < 20))
    return { label: "Pre/After-hours", tone: "warn" };
  return { label: "US cerrado", tone: "dim" };
}

export function TopBar() {
  const setCommandOpen = useUI((s) => s.setCommandOpen);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = now ? marketStatus(now) : { label: "—", tone: "dim" as const };

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-8 w-[360px] items-center gap-2 rounded-md border border-border bg-bg px-3 text-xs text-fg-dim hover:text-fg transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Buscar ticker, sección, preset…</span>
        <span className="chip !px-1.5 !py-0">⌘K</span>
      </button>

      <div className="ml-auto flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Activity
            className={
              status.tone === "pos"
                ? "h-3.5 w-3.5 text-pos"
                : status.tone === "warn"
                ? "h-3.5 w-3.5 text-warn"
                : "h-3.5 w-3.5 text-fg-dim"
            }
          />
          <span
            className={
              status.tone === "pos" ? "pos-text" : status.tone === "warn" ? "warn-text" : "text-fg-dim"
            }
          >
            {status.label}
          </span>
        </div>
        <div className="num text-fg-dim tabular-nums min-w-[64px] text-right">
          {now ? formatClock(now) : "—"}
        </div>
      </div>
    </header>
  );
}
