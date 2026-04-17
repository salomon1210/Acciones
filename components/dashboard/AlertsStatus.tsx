import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

const MOCK = {
  active: 7,
  triggeredToday: 2,
  upcoming: [
    { symbol: "AAPL", type: "price", description: "AAPL cruza $230 hacia arriba" },
    { symbol: "TSLA", type: "rsi", description: "TSLA RSI > 70" },
    { symbol: "BTC-USD", type: "pct_change", description: "BTC -5% en 24h" },
  ],
};

export function AlertsStatus() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Alertas</CardTitle>
        <Bell className="h-3.5 w-3.5 text-fg-dim" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Criollo>
          Reglas que corren en segundo plano cada minuto. Cuando una se cumple te avisa en la app y opcionalmente en Telegram/Discord.
        </Criollo>
        <div className="flex gap-2">
          <Badge variant="pos">{MOCK.active} activas</Badge>
          <Badge variant="warn">{MOCK.triggeredToday} disparadas hoy</Badge>
        </div>
        <div className="space-y-1">
          {MOCK.upcoming.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="ticker text-fg w-14">{a.symbol}</span>
              <span className="text-fg-dim truncate">{a.description}</span>
            </div>
          ))}
        </div>
        <Link href="/alerts" className="text-[11px] text-fg-dim hover:text-fg block pt-1">
          Gestionar alertas →
        </Link>
      </CardContent>
    </Card>
  );
}
