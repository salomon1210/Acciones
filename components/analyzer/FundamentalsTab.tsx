import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo, Explain } from "@/components/ui/explain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricTile } from "@/components/analyzer/MetricTile";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { assessROE, assessDebtEquity, assessFcfYield, extractSeries, cagr, pctGrowth } from "@/lib/analysis/fundamentals";
import type { UnifiedFundamentals } from "@/lib/api/unified";

type Statements = {
  income: Array<Record<string, number | string | null>>;
  balance: Array<Record<string, number | string | null>>;
  cashflow: Array<Record<string, number | string | null>>;
};

export function FundamentalsTab({
  fundamentals,
  statements,
}: {
  fundamentals: UnifiedFundamentals | null;
  statements: Statements;
}) {
  if (!fundamentals) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-xs text-fg-dim">
          No encontré estados financieros para este activo.
        </CardContent>
      </Card>
    );
  }

  const roe = assessROE(fundamentals.returnOnEquity ?? null);
  const debtEq = assessDebtEquity(fundamentals.debtToEquity ?? null);
  const fcfY = assessFcfYield(fundamentals.freeCashFlow ?? null, fundamentals.marketCap ?? null);

  const revenueSeries = extractSeries(statements.income, "totalRevenue");
  const netIncomeSeries = extractSeries(statements.income, "netIncome");
  const fcfSeries = extractSeries(statements.cashflow, "freeCashFlow");

  const periods = Math.max(1, revenueSeries.length - 1);
  const revenueCAGR = cagr(revenueSeries[0]?.value, revenueSeries[revenueSeries.length - 1]?.value, periods);
  const netIncomeCAGR = cagr(netIncomeSeries[0]?.value, netIncomeSeries[netIncomeSeries.length - 1]?.value, periods);
  const fcfCAGR = cagr(fcfSeries[0]?.value, fcfSeries[fcfSeries.length - 1]?.value, periods);

  return (
    <div className="space-y-4">
      <Criollo>
        Acá está cómo factura, cuánto gana y cuánta plata le queda después de pagar todo. Si las líneas suben en el tiempo, el negocio crece.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle>Márgenes y rentabilidad</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <MetricTile
            label="Margen bruto"
            term="grossmargin"
            value={formatPercent(fundamentals.grossMargin, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Margen operativo"
            term="operatingmargin"
            value={formatPercent(fundamentals.operatingMargin, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Margen neto"
            term="netmargin"
            value={formatPercent(fundamentals.profitMargin, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="ROE"
            term="roe"
            value={formatPercent(fundamentals.returnOnEquity, { scale: "unit", signed: false })}
            assessment={roe.label}
          />
          <MetricTile
            label="ROA"
            term="roa"
            value={formatPercent(fundamentals.returnOnAssets, { scale: "unit", signed: false })}
          />
          <MetricTile
            label="Deuda/Equity"
            term="debtequity"
            value={debtEq.value != null ? debtEq.value.toFixed(2) : "—"}
            assessment={debtEq.label}
          />
          <MetricTile
            label="Liquidez corriente"
            term="currentratio"
            value={fundamentals.currentRatio != null ? fundamentals.currentRatio.toFixed(2) : "—"}
          />
          <MetricTile
            label="FCF Yield"
            term="fcfyield"
            value={fcfY.value != null ? `${fcfY.value.toFixed(2)}%` : "—"}
            assessment={fcfY.label}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crecimiento histórico ({periods}Y)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile
            label="Ventas CAGR"
            term="revenue"
            value={formatPercent(revenueCAGR, { scale: "unit" })}
          />
          <MetricTile
            label="Net Income CAGR"
            value={formatPercent(netIncomeCAGR, { scale: "unit" })}
          />
          <MetricTile
            label="FCF CAGR"
            term="fcf"
            value={formatPercent(fcfCAGR, { scale: "unit" })}
          />
        </CardContent>
      </Card>

      <StatementTable title="Estado de resultados" rows={statements.income} keys={[
        { key: "totalRevenue", label: "Ventas", term: "revenue" },
        { key: "grossProfit", label: "Ganancia bruta" },
        { key: "operatingIncome", label: "Ganancia operativa" },
        { key: "netIncome", label: "Ganancia neta" },
        { key: "ebitda", label: "EBITDA", term: "ebitda" },
      ]} />

      <StatementTable title="Balance" rows={statements.balance} keys={[
        { key: "totalAssets", label: "Activos totales" },
        { key: "totalLiab", label: "Pasivos totales" },
        { key: "totalStockholderEquity", label: "Patrimonio" },
        { key: "cash", label: "Caja" },
        { key: "totalDebt", label: "Deuda total" },
      ]} />

      <StatementTable title="Flujo de caja" rows={statements.cashflow} keys={[
        { key: "operatingCashflow", label: "Operativo" },
        { key: "capitalExpenditures", label: "CapEx" },
        { key: "freeCashFlow", label: "Free Cash Flow", term: "fcf" },
        { key: "dividendsPaid", label: "Dividendos pagados" },
      ]} />
    </div>
  );
}

function StatementTable({
  title,
  rows,
  keys,
}: {
  title: string;
  rows: Array<Record<string, number | string | null>>;
  keys: Array<{ key: string; label: string; term?: string }>;
}) {
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="p-4 text-center text-xs text-fg-dim">Sin datos.</CardContent>
      </Card>
    );
  }
  const periods = rows.map((r) => String(r.period ?? ""));
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              {periods.map((p) => (
                <TableHead key={p} className="text-right num">{p.slice(0, 7)}</TableHead>
              ))}
              <TableHead className="text-right num">YoY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map(({ key, label, term }) => {
              const latest = rows[0]?.[key];
              const prev = rows[1]?.[key];
              const yoy = pctGrowth(
                typeof prev === "number" ? prev : null,
                typeof latest === "number" ? latest : null
              );
              return (
                <TableRow key={key}>
                  <TableCell className="text-fg-dim">
                    {term ? <Explain term={term}>{label}</Explain> : label}
                  </TableCell>
                  {rows.map((row, i) => {
                    const v = row[key];
                    return (
                      <TableCell key={i} className="text-right num text-fg">
                        {typeof v === "number" ? formatCurrency(v, { compact: true, decimals: 2 }) : "—"}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right num">
                    <span className={yoy == null ? "text-fg-dim" : yoy >= 0 ? "pos-text" : "neg-text"}>
                      {formatPercent(yoy, { scale: "unit" })}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
