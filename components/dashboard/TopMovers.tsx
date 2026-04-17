import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { formatCurrency, formatPercent, signClass } from "@/lib/utils/format";

const MOCK = [
  { ticker: "NVDA", price: 142.32, pct: 0.0412 },
  { ticker: "TSLA", price: 238.11, pct: 0.0287 },
  { ticker: "META", price: 578.91, pct: 0.0154 },
  { ticker: "AAPL", price: 226.77, pct: -0.0084 },
  { ticker: "GOOGL", price: 165.03, pct: -0.0121 },
  { ticker: "JPM", price: 221.4, pct: -0.0031 },
];

export function TopMovers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de tu watchlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Criollo>
          Los activos que seguís ordenados por cambio de hoy. Verde = sube, rojo = baja. Click abre el análisis completo.
        </Criollo>
        <div className="space-y-0.5">
          {MOCK.map((m) => (
            <Link
              key={m.ticker}
              href={`/analyzer/${m.ticker}`}
              className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-surface-2 transition-colors"
            >
              <span className="ticker text-fg">{m.ticker}</span>
              <div className="flex items-center gap-3">
                <span className="num text-fg-dim">{formatCurrency(m.price)}</span>
                <span className={`num w-16 text-right ${signClass(m.pct)}`}>
                  {formatPercent(m.pct)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
