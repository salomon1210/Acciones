import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, relativeTime } from "@/lib/utils/format";

type EarningsItem = {
  date: string;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  hour: string;
};

type InsiderTx = {
  name: string;
  transactionDate: string;
  share: number;
  change: number;
  transactionPrice: number;
  transactionCode: string;
};

type Filing = {
  form: string;
  filingDate: string;
  url: string;
};

export function CatalystsTab({
  earnings,
  insiders,
  filings,
}: {
  earnings: EarningsItem[];
  insiders: InsiderTx[];
  filings: Filing[];
}) {
  const upcoming = earnings.filter((e) => new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date));
  const nextEarnings = upcoming[0];
  const past = earnings.filter((e) => new Date(e.date) < new Date()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="space-y-4">
      <Criollo>
        Los &quot;catalizadores&quot; son eventos que pueden mover el precio: resultados trimestrales, compras o ventas de ejecutivos, y filings importantes en la SEC.
      </Criollo>

      <Card>
        <CardHeader><CardTitle>Próximo earnings</CardTitle></CardHeader>
        <CardContent className="text-xs">
          {nextEarnings ? (
            <div className="flex items-center gap-3">
              <Badge variant="info">{new Date(nextEarnings.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</Badge>
              <span className="text-fg-dim">Horario: {nextEarnings.hour || "—"}</span>
              <span className="text-fg-dim">EPS est.: <span className="text-fg num">{nextEarnings.epsEstimate?.toFixed(2) ?? "—"}</span></span>
              <span className="text-fg-dim">Rev est.: <span className="text-fg num">{formatCurrency(nextEarnings.revenueEstimate, { compact: true })}</span></span>
            </div>
          ) : (
            <span className="text-fg-dim">No hay earnings programados (o falta API key de Finnhub).</span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historial reciente de earnings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {past.length === 0 ? (
            <div className="p-4 text-xs text-fg-dim text-center">Sin historial disponible.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right num">EPS est.</TableHead>
                  <TableHead className="text-right num">EPS real</TableHead>
                  <TableHead className="text-right num">Sorpresa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {past.map((e, i) => {
                  const surprise = e.epsEstimate != null && e.epsActual != null ? (e.epsActual - e.epsEstimate) / Math.abs(e.epsEstimate) : null;
                  return (
                    <TableRow key={i}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell className="text-right num">{e.epsEstimate?.toFixed(2) ?? "—"}</TableCell>
                      <TableCell className="text-right num">{e.epsActual?.toFixed(2) ?? "—"}</TableCell>
                      <TableCell className="text-right num">
                        {surprise != null ? (
                          <span className={surprise >= 0 ? "pos-text" : "neg-text"}>
                            {(surprise * 100).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Transacciones de insiders (últimas)</CardTitle></CardHeader>
        <CardContent className="p-0">
          {insiders.length === 0 ? (
            <div className="p-4 text-xs text-fg-dim text-center">Sin datos (requiere API key de Finnhub).</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right num">Cambio</TableHead>
                  <TableHead className="text-right num">Precio</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insiders.slice(0, 12).map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-fg">{t.name}</TableCell>
                    <TableCell className="text-fg-dim">{t.transactionDate}</TableCell>
                    <TableCell className={`text-right num ${t.change > 0 ? "pos-text" : "neg-text"}`}>
                      {t.change > 0 ? "+" : ""}{t.change.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-right num">${t.transactionPrice?.toFixed(2) ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{t.transactionCode}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Filings recientes (SEC EDGAR)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filings.length === 0 ? (
            <div className="text-xs text-fg-dim text-center">No encontré filings para este ticker.</div>
          ) : (
            filings.slice(0, 10).map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs hover:bg-surface-2 rounded-md px-2 py-1.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{f.form}</Badge>
                  <span className="text-fg-dim">{f.filingDate}</span>
                </div>
                <span className="text-fg-dim text-[11px]">{relativeTime(f.filingDate)}</span>
              </a>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
