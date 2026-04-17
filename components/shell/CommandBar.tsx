"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUI } from "@/lib/stores/ui";
import {
  LineChart,
  Newspaper,
  Briefcase,
  Filter,
  Bell,
  Sunrise,
  BookOpen,
  Home,
  TrendingUp,
} from "lucide-react";

const DEFAULT_TICKERS = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "META", "TSLA", "AMZN", "BRK-B",
  "JPM", "V", "MA", "UNH", "XOM", "WMT", "PG", "JNJ", "HD",
  "SPY", "QQQ", "DIA", "IWM", "VTI", "VOO", "SCHD", "TLT", "GLD",
  "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD",
];

const PAGES = [
  { href: "/", label: "Dashboard", icon: Home, desc: "Resumen del mercado y portfolio" },
  { href: "/news", label: "Noticias", icon: Newspaper, desc: "Feed con sentiment" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, desc: "Posiciones y P&L" },
  { href: "/screener", label: "Screener", icon: Filter, desc: "Buscar oportunidades" },
  { href: "/alerts", label: "Alertas", icon: Bell, desc: "Notificaciones automáticas" },
  { href: "/briefing", label: "Briefing diario", icon: Sunrise, desc: "Resumen generado por AI" },
  { href: "/glossary", label: "Glosario", icon: BookOpen, desc: "Términos explicados" },
];

export function CommandBar() {
  const { commandOpen, setCommandOpen } = useUI();
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  const go = (href: string) => {
    setCommandOpen(false);
    setQuery("");
    router.push(href);
  };

  const q = query.trim().toUpperCase();
  const tickerMatches = q
    ? DEFAULT_TICKERS.filter((t) => t.includes(q)).slice(0, 8)
    : DEFAULT_TICKERS.slice(0, 8);

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Buscar ticker (AAPL, BTC-USD), sección o preset…"
      />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        {q && /^[A-Z0-9.\-]{1,8}$/.test(q) && (
          <CommandGroup heading="Analizar ticker">
            <CommandItem onSelect={() => go(`/analyzer/${q}`)}>
              <TrendingUp className="h-3.5 w-3.5 text-pos" />
              <span className="ticker">{q}</span>
              <span className="text-fg-dim">Abrir análisis completo →</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="Tickers frecuentes">
          {tickerMatches.map((t) => (
            <CommandItem key={t} onSelect={() => go(`/analyzer/${t}`)}>
              <LineChart className="h-3.5 w-3.5 text-fg-dim" />
              <span className="ticker">{t}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Ir a">
          {PAGES.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                <Icon className="h-3.5 w-3.5 text-fg-dim" />
                <span>{p.label}</span>
                <span className="ml-auto text-[10px] text-fg-muted">{p.desc}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
