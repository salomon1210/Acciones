import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, formatPercent, signClass } from "@/lib/utils/format";
import type { PositionRow } from "@/lib/portfolio/types";

export function PositionsTable({ positions }: { positions: PositionRow[] }) {
  if (positions.length === 0) {
    return (
      <div className="border border-border rounded-md p-6 bg-surface text-center text-xs text-fg-dim">
        Todavía no cargaste posiciones. Conectá Binance o importá un CSV.
      </div>
    );
  }
  return (
    <div className="border border-border rounded-md bg-surface overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Clase</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead className="text-right num">Cantidad</TableHead>
            <TableHead className="text-right num">Costo prom.</TableHead>
            <TableHead className="text-right num">Precio</TableHead>
            <TableHead className="text-right num">Valor</TableHead>
            <TableHead className="text-right num">PnL</TableHead>
            <TableHead className="text-right num">PnL %</TableHead>
            <TableHead className="text-right num">Día</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/analyzer/${p.symbol}`} className="ticker text-fg hover:text-pos transition-colors">
                  {p.symbol}
                </Link>
              </TableCell>
              <TableCell><Badge variant="outline">{labelAssetType(p.assetType)}</Badge></TableCell>
              <TableCell className="text-fg-dim text-[10px]">{p.source}</TableCell>
              <TableCell className="text-right num">{formatNumber(p.quantity, { decimals: p.assetType === "crypto" ? 6 : 2 })}</TableCell>
              <TableCell className="text-right num">{formatCurrency(p.avgCost, { decimals: 2 })}</TableCell>
              <TableCell className="text-right num">{formatCurrency(p.price ?? null, { decimals: 2 })}</TableCell>
              <TableCell className="text-right num">{formatCurrency(p.marketValue ?? null, { decimals: 2 })}</TableCell>
              <TableCell className={`text-right num ${signClass(p.pnlAbs)}`}>{formatCurrency(p.pnlAbs ?? null, { decimals: 2 })}</TableCell>
              <TableCell className={`text-right num ${signClass(p.pnlPct)}`}>{formatPercent(p.pnlPct, { scale: "unit" })}</TableCell>
              <TableCell className={`text-right num ${signClass(p.dayChangePct)}`}>{formatPercent(p.dayChangePct, { scale: "unit" })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function labelAssetType(t: PositionRow["assetType"]): string {
  switch (t) {
    case "equity": return "Acción";
    case "etf": return "ETF";
    case "crypto": return "Cripto";
    case "bond": return "Bono";
    case "index": return "Índice";
    case "fx": return "Divisa";
  }
}
