import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { formatCurrency, formatPercent, signClass } from "@/lib/utils/format";
import { ArrowUpRight } from "lucide-react";

// Placeholder aggregate — wired to real data in Fase 5.
const MOCK = {
  totalValue: 42315.78,
  dayPnl: 287.44,
  dayPnlPct: 0.0068,
  totalPnl: 5831.12,
  totalPnlPct: 0.16,
  positions: 14,
};

export function PortfolioSummary() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Tu portfolio</CardTitle>
        <Link
          href="/portfolio"
          className="text-[11px] text-fg-dim hover:text-fg flex items-center gap-1"
        >
          Ver detalle <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <Criollo>
          Suma de todo lo que tenés en Binance + lo que importaste por CSV del bróker. Lo valuamos con el último precio disponible.
        </Criollo>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-fg-muted">Valor total</div>
          <div className="num text-2xl text-fg">{formatCurrency(MOCK.totalValue)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-muted">P&L día</div>
            <div className={`num text-sm ${signClass(MOCK.dayPnl)}`}>
              {formatCurrency(MOCK.dayPnl)}
            </div>
            <div className={`num text-[11px] ${signClass(MOCK.dayPnl)}`}>
              {formatPercent(MOCK.dayPnlPct)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-muted">P&L total</div>
            <div className={`num text-sm ${signClass(MOCK.totalPnl)}`}>
              {formatCurrency(MOCK.totalPnl)}
            </div>
            <div className={`num text-[11px] ${signClass(MOCK.totalPnl)}`}>
              {formatPercent(MOCK.totalPnlPct)}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-fg-dim pt-1">{MOCK.positions} posiciones abiertas</div>
      </CardContent>
    </Card>
  );
}
