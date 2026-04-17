"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Activity, Menu } from "lucide-react";
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
  const setMobileNavOpen = useUI((s) => s.setMobileNavOpen);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = now ? marketStatus(now) : { label: "—", tone: "dim" as const };
  const shortStatus =
    status.tone === "pos" ? "Abierto" : status.tone === "warn" ? "Pre/After" : status.label.startsWith("Mercado cerrado") ? "Cerrado" : "Cerrado";

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 md:px-4">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="md:hidden rounded p-2 -ml-1 text-fg-dim hover:text-fg hover:bg-surface-2"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-8 flex-1 md:flex-none md:w-[360px] items-center gap-2 rounded-md border border-border bg-bg px-3 text-xs text-fg-dim hover:text-fg transition-colors min-w-0"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">
          <span className="hidden md:inline">Buscar ticker, sección, preset…</span>
          <span className="md:hidden">Buscar ticker…</span>
        </span>
        <span className="chip !px-1.5 !py-0 hidden md:inline">⌘K</span>
      </button>

      <div className="ml-auto flex items-center gap-3 md:gap-4 text-xs">
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
            <span className="hidden md:inline">{status.label}</span>
            <span className="md:hidden">{shortStatus}</span>
          </span>
        </div>
        <div className="num text-fg-dim tabular-nums min-w-[52px] md:min-w-[64px] text-right">
          {now ? formatClock(now) : "—"}
        </div>
      </div>
    </header>
  );
}
