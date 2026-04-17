import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo, Explain } from "@/components/ui/explain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

export type PeerRow = {
  symbol: string;
  name?: string | null;
  price?: number | null;
  marketCap?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  psRatio?: number | null;
  evEbitda?: number | null;
  grossMargin?: number | null;
  returnOnEquity?: number | null;
};

export function PeersTab({ current, peers }: { current: PeerRow; peers: PeerRow[] }) {
  const rows = [current, ...peers];
  return (
    <div className="space-y-4">
      <Criollo>
        Comparamos esta empresa contra sus pares del mismo sector. Mirá si cotiza más cara o más barata en múltiplos, y si tiene márgenes o ROE superiores al promedio.
      </Criollo>

      <Card>
        <CardHeader><CardTitle>Comparación con peers</CardTitle></CardHeader>
        <CardContent className="p-0">
          {peers.length === 0 ? (
            <div className="p-4 text-xs text-fg-dim text-center">
              No pude obtener peers (se necesita API key de FMP o configuración manual).
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right num">Precio</TableHead>
                  <TableHead className="text-right num">Mkt Cap</TableHead>
                  <TableHead className="text-right num"><Explain term="pe">P/E</Explain></TableHead>
                  <TableHead className="text-right num"><Explain term="pb">P/B</Explain></TableHead>
                  <TableHead className="text-right num"><Explain term="ps">P/S</Explain></TableHead>
                  <TableHead className="text-right num"><Explain term="evebitda">EV/EBITDA</Explain></TableHead>
                  <TableHead className="text-right num"><Explain term="grossmargin">M. Bruto</Explain></TableHead>
                  <TableHead className="text-right num"><Explain term="roe">ROE</Explain></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.symbol} className={i === 0 ? "bg-surface-2/60" : ""}>
                    <TableCell>
                      <Link href={`/analyzer/${r.symbol}`} className="ticker text-fg hover:text-pos transition-colors">
                        {r.symbol}
                      </Link>
                      {r.name && <div className="text-[10px] text-fg-dim">{r.name}</div>}
                    </TableCell>
                    <TableCell className="text-right num">{formatCurrency(r.price ?? null, { decimals: 2 })}</TableCell>
                    <TableCell className="text-right num">{formatNumber(r.marketCap ?? null, { compact: true })}</TableCell>
                    <TableCell className="text-right num">{formatNumber(r.peRatio ?? null, { decimals: 1 })}</TableCell>
                    <TableCell className="text-right num">{formatNumber(r.pbRatio ?? null, { decimals: 2 })}</TableCell>
                    <TableCell className="text-right num">{formatNumber(r.psRatio ?? null, { decimals: 2 })}</TableCell>
                    <TableCell className="text-right num">{formatNumber(r.evEbitda ?? null, { decimals: 1 })}</TableCell>
                    <TableCell className="text-right num">{formatPercent(r.grossMargin ?? null, { scale: "unit", signed: false })}</TableCell>
                    <TableCell className="text-right num">{formatPercent(r.returnOnEquity ?? null, { scale: "unit", signed: false })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
