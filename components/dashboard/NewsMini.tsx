import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils/format";

const MOCK = [
  {
    source: "Reuters",
    title: "Fed señala posible recorte de tasas en diciembre ante desaceleración laboral",
    ago: Date.now() - 1000 * 60 * 22,
    sentiment: "positive" as const,
    tickers: ["SPY", "QQQ"],
  },
  {
    source: "Bloomberg",
    title: "NVIDIA supera expectativas: ingresos +94% YoY, guía por arriba del consenso",
    ago: Date.now() - 1000 * 60 * 55,
    sentiment: "positive" as const,
    tickers: ["NVDA"],
  },
  {
    source: "FT",
    title: "China impone aranceles adicionales a exportaciones tech de EEUU",
    ago: Date.now() - 1000 * 60 * 90,
    sentiment: "negative" as const,
    tickers: ["AAPL", "QQQ"],
  },
  {
    source: "WSJ",
    title: "Berkshire Hathaway incrementa posición en compañías energéticas",
    ago: Date.now() - 1000 * 60 * 60 * 3,
    sentiment: "neutral" as const,
    tickers: ["BRK-B", "XOM"],
  },
  {
    source: "CoinDesk",
    title: "BTC alcanza nuevo máximo anual tras aprobación de ETF en Europa",
    ago: Date.now() - 1000 * 60 * 60 * 4,
    sentiment: "positive" as const,
    tickers: ["BTC-USD"],
  },
];

function sentimentBadge(s: "positive" | "neutral" | "negative") {
  if (s === "positive") return <Badge variant="pos">Positiva</Badge>;
  if (s === "negative") return <Badge variant="neg">Negativa</Badge>;
  return <Badge variant="outline">Neutra</Badge>;
}

export function NewsMini() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas noticias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Criollo>
          Resumen de lo más reciente. El sentiment (positivo / negativo / neutro) lo estima la AI leyendo el titular.
        </Criollo>
        <div className="space-y-1">
          {MOCK.map((n, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded px-2 py-2 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-2 text-[10px] text-fg-muted">
                <span className="uppercase tracking-wider">{n.source}</span>
                <span>·</span>
                <span>{relativeTime(n.ago)}</span>
                <span className="ml-auto">{sentimentBadge(n.sentiment)}</span>
              </div>
              <div className="text-xs text-fg leading-relaxed">{n.title}</div>
              <div className="flex gap-1">
                {n.tickers.map((t) => (
                  <Link key={t} href={`/analyzer/${t}`} className="chip hover:text-fg">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Link href="/news" className="text-[11px] text-fg-dim hover:text-fg block pt-1">
          Ver todas las noticias →
        </Link>
      </CardContent>
    </Card>
  );
}
