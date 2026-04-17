"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SentimentBadge } from "@/components/news/SentimentBadge";
import { relativeTime } from "@/lib/utils/format";
import type { UnifiedNewsItem } from "@/lib/api/news-unified";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

type Filter = "all" | "positive" | "negative" | "neutral" | "crypto";

const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "TSLA", "AMZN", "BRK-B", "SPY", "QQQ", "BTC-USD"];

export function NewsFeed() {
  const [items, setItems] = useState<UnifiedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [tickerInput, setTickerInput] = useState("");
  const [tickers, setTickers] = useState<string[]>(DEFAULT_WATCHLIST);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [selected, setSelected] = useState<UnifiedNewsItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/news", window.location.origin);
      if (onlyWatchlist && tickers.length) url.searchParams.set("tickers", tickers.join(","));
      const res = await fetch(url.toString());
      const data = (await res.json()) as { items: UnifiedNewsItem[] };
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyWatchlist, tickers]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === "positive" && n.sentiment !== "positive") return false;
      if (filter === "negative" && n.sentiment !== "negative") return false;
      if (filter === "neutral" && n.sentiment !== null && n.sentiment !== "neutral") return false;
      if (filter === "crypto" && n.category !== "crypto") return false;
      return true;
    });
  }, [items, filter]);

  return (
    <div className="space-y-4">
      <Criollo>
        Feed de noticias del mercado. Se actualiza solo cada 60 segundos. Filtrá por sentimiento o hacé clic en &quot;Ver qué significa&quot; para una lectura rápida con AI.
      </Criollo>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todas</FilterChip>
          <FilterChip active={filter === "positive"} onClick={() => setFilter("positive")}>Positivas</FilterChip>
          <FilterChip active={filter === "negative"} onClick={() => setFilter("negative")}>Negativas</FilterChip>
          <FilterChip active={filter === "neutral"} onClick={() => setFilter("neutral")}>Neutras</FilterChip>
          <FilterChip active={filter === "crypto"} onClick={() => setFilter("crypto")}>Cripto</FilterChip>

          <div className="mx-2 h-5 border-l border-border" />

          <Button
            size="sm"
            variant={onlyWatchlist ? "default" : "outline"}
            onClick={() => setOnlyWatchlist((v) => !v)}
          >
            {onlyWatchlist ? "Solo watchlist" : "Toda la market"}
          </Button>

          <div className="flex items-center gap-1">
            <Input
              className="h-8 w-40 text-xs"
              placeholder="Agregar ticker..."
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tickerInput.trim()) {
                  setTickers((t) => Array.from(new Set([...t, tickerInput.trim()])));
                  setTickerInput("");
                }
              }}
            />
          </div>

          <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>

          <div className="ml-auto text-[10px] text-fg-muted">
            {filtered.length} noticias · actualiza cada 60s
          </div>
        </CardContent>
      </Card>

      {onlyWatchlist && tickers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tickers.map((t) => (
            <button
              key={t}
              onClick={() => setTickers((ts) => ts.filter((x) => x !== t))}
              className="ticker text-[11px] border border-border rounded-md px-2 py-0.5 text-fg-dim hover:text-neg hover:border-neg/40 transition-colors"
              title="Quitar"
            >
              {t} ×
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {loading && items.length === 0 && (
          <div className="p-6 text-center text-xs text-fg-dim">Cargando noticias...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-6 text-center text-xs text-fg-dim">
            No hay noticias con los filtros actuales.
          </div>
        )}
        {filtered.map((n) => (
          <div
            key={n.id}
            className="border border-border rounded-md p-3 hover:bg-surface-2/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              {n.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.image} alt="" className="w-20 h-20 object-cover rounded-md flex-shrink-0 hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm text-fg leading-snug flex-1">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="hover:text-pos transition-colors">
                      {n.headline}
                    </a>
                  </h3>
                  <SentimentBadge sentiment={n.sentiment} />
                </div>
                {n.summary && (
                  <p className="text-[11px] text-fg-dim leading-relaxed mb-2 line-clamp-2">{n.summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-fg-muted">
                  <span>{n.source}</span>
                  <span>·</span>
                  <span>{relativeTime(n.publishedAt)}</span>
                  {n.tickers.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex gap-1">
                        {n.tickers.slice(0, 5).map((t) => (
                          <Link
                            key={t}
                            href={`/analyzer/${t}`}
                            className="ticker text-[10px] border border-border rounded px-1.5 py-0.5 text-fg-dim hover:text-pos hover:border-pos/40 transition-colors"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                  <Badge variant="outline" className="ml-auto text-[9px]">{n.provider}</Badge>
                  <button
                    onClick={() => setSelected(n)}
                    className="text-pos hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    ¿Qué significa?
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected && <NewsAnalysis item={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 h-7 text-[11px] rounded-md border transition-colors ${
        active ? "bg-surface-2 border-pos/40 text-fg" : "border-border text-fg-dim hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function NewsAnalysis({ item }: { item: UnifiedNewsItem }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ summary: string; impact: string; aiPowered: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: item.headline, summary: item.summary, tickers: item.tickers }),
      });
      if (!res.ok) {
        if (res.status === 503) {
          setError("ANTHROPIC_API_KEY no está configurada. Mostrando lectura heurística.");
        } else {
          setError("No pude generar el análisis.");
        }
        return;
      }
      const data = (await res.json()) as { summary: string; impact: string; aiPowered: boolean };
      setAnalysis(data);
    } catch {
      setError("Error conectando al servicio.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-left leading-snug">{item.headline}</SheetTitle>
      </SheetHeader>
      <div className="mt-3 space-y-4">
        <div className="flex items-center gap-2 text-[10px] text-fg-muted">
          <span>{item.source}</span>
          <span>·</span>
          <span>{relativeTime(item.publishedAt)}</span>
          <SentimentBadge sentiment={item.sentiment} />
        </div>
        {item.summary && (
          <p className="text-xs text-fg-dim leading-relaxed">{item.summary}</p>
        )}
        {item.tickers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tickers.map((t) => (
              <Link
                key={t}
                href={`/analyzer/${t}`}
                className="ticker text-[10px] border border-border rounded px-1.5 py-0.5 text-fg-dim hover:text-pos hover:border-pos/40 transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2 mb-2 text-xs text-fg">
            <Sparkles className="w-3.5 h-3.5 text-pos" />
            <span className="font-medium">Lectura rápida</span>
          </div>
          {loading && <div className="text-xs text-fg-dim flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Analizando...</div>}
          {error && <div className="text-xs text-warn mb-2">{error}</div>}
          {analysis && (
            <div className="space-y-3">
              <p className="text-xs text-fg leading-relaxed">{analysis.summary}</p>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">Impacto esperado</div>
                <p className="text-xs text-fg-dim leading-relaxed">{analysis.impact}</p>
              </div>
              {!analysis.aiPowered && (
                <div className="text-[10px] text-fg-muted italic">
                  Lectura heurística (activá ANTHROPIC_API_KEY para análisis con Claude).
                </div>
              )}
            </div>
          )}
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs border border-border rounded-md py-2 hover:bg-surface-2 transition-colors"
        >
          Leer nota original →
        </a>
      </div>
    </>
  );
}
