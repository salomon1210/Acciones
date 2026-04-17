"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { SECTORS, COUNTRIES } from "@/lib/screener/universe";
import type { ScreenerFilters, ScreenerRow, ScreenerPreset } from "@/lib/screener/service";

const PRESETS: ScreenerPreset[] = [
  { id: "deep-value", label: "Deep Value", description: "Múltiplos bajos, ROE decente, crecimiento positivo.", filters: { maxPE: 15, maxPS: 3, maxEvEbitda: 12, minROE: 10, minRevenueGrowth: 0 } },
  { id: "quality", label: "Quality Compounders", description: "ROE alto, márgenes fuertes, balance sano.", filters: { minROE: 18, maxDebtEquity: 1.5, minRevenueGrowth: 5 } },
  { id: "oversold", label: "Oversold Blue Chips", description: "Grandes caídas con RSI bajo.", filters: { minMarketCap: 50e9, maxRsi: 35, minDistFromHigh: 0.15 } },
  { id: "hi-div", label: "High Dividend Safe", description: "Dividendo atractivo con payout razonable.", filters: { minDividendYield: 0.03, maxDebtEquity: 2, minROE: 8 } },
];

const EMPTY: ScreenerFilters = {};

export function ScreenerClient() {
  const [filters, setFilters] = useState<ScreenerFilters>(EMPTY);
  const [rows, setRows] = useState<ScreenerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function run(f: ScreenerFilters) {
    setLoading(true);
    try {
      const res = await fetch("/api/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = (await res.json()) as { rows: ScreenerRow[]; total: number };
      setRows(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(p: ScreenerPreset) {
    setFilters(p.filters);
    run(p.filters);
  }

  function resetFilters() {
    setFilters(EMPTY);
    run(EMPTY);
  }

  const active = useMemo(() => Object.entries(filters).filter(([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : true)), [filters]);

  return (
    <div className="space-y-4">
      <Criollo>
        Filtrá una universo de empresas grandes según lo que te importe: múltiplos baratos, calidad alta, caídas técnicas, o rendimiento por dividendo. Usá un preset para arrancar rápido.
      </Criollo>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className="text-left border border-border rounded-md px-3 py-2 hover:border-pos/40 hover:bg-surface-2 transition-colors"
              >
                <div className="text-xs text-fg font-medium">{p.label}</div>
                <div className="text-[10px] text-fg-dim mt-0.5">{p.description}</div>
              </button>
            ))}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs text-fg-dim hover:text-fg select-none">
              Filtros avanzados {active.length > 0 && <Badge variant="info" className="ml-2">{active.length} activos</Badge>}
            </summary>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
              <NumInput label="Market Cap min (USD)" value={filters.minMarketCap} onChange={(v) => setFilters((f) => ({ ...f, minMarketCap: v }))} />
              <NumInput label="P/E máx." value={filters.maxPE} onChange={(v) => setFilters((f) => ({ ...f, maxPE: v }))} />
              <NumInput label="P/S máx." value={filters.maxPS} onChange={(v) => setFilters((f) => ({ ...f, maxPS: v }))} />
              <NumInput label="EV/EBITDA máx." value={filters.maxEvEbitda} onChange={(v) => setFilters((f) => ({ ...f, maxEvEbitda: v }))} />
              <NumInput label="ROE mín. %" value={filters.minROE} onChange={(v) => setFilters((f) => ({ ...f, minROE: v }))} />
              <NumInput label="Deuda/Eq. máx." value={filters.maxDebtEquity} onChange={(v) => setFilters((f) => ({ ...f, maxDebtEquity: v }))} />
              <NumInput label="Growth mín. %" value={filters.minRevenueGrowth} onChange={(v) => setFilters((f) => ({ ...f, minRevenueGrowth: v }))} />
              <NumInput label="Div. mín." value={filters.minDividendYield} onChange={(v) => setFilters((f) => ({ ...f, minDividendYield: v }))} step={0.005} />
              <NumInput label="RSI máx." value={filters.maxRsi} onChange={(v) => setFilters((f) => ({ ...f, maxRsi: v }))} />
              <NumInput label="Caída 52W mín." value={filters.minDistFromHigh} onChange={(v) => setFilters((f) => ({ ...f, minDistFromHigh: v }))} step={0.05} />
              <MultiSelect label="Sectores" options={SECTORS} value={filters.sectors ?? []} onChange={(v) => setFilters((f) => ({ ...f, sectors: v }))} />
              <MultiSelect label="Países" options={COUNTRIES} value={filters.countries ?? []} onChange={(v) => setFilters((f) => ({ ...f, countries: v }))} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={() => run(filters)} disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
                Aplicar filtros
              </Button>
              <Button size="sm" variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-fg-dim">
        <div>{loading ? "Cargando..." : `${rows.length} resultados de ${total}`}</div>
      </div>

      <div className="border border-border rounded-md bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right num">Mkt Cap</TableHead>
              <TableHead className="text-right num">P/E</TableHead>
              <TableHead className="text-right num">P/S</TableHead>
              <TableHead className="text-right num">EV/EBITDA</TableHead>
              <TableHead className="text-right num">ROE</TableHead>
              <TableHead className="text-right num">Growth</TableHead>
              <TableHead className="text-right num">Div.</TableHead>
              <TableHead className="text-right num">RSI</TableHead>
              <TableHead className="text-right num">52W↓</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-xs text-fg-dim py-6">
                  Ningún activo cumple todos los filtros. Probá aflojando alguno.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.symbol}>
                <TableCell>
                  <Link href={`/analyzer/${r.symbol}`} className="ticker text-fg hover:text-pos transition-colors">
                    {r.symbol}
                  </Link>
                  {r.name && <div className="text-[10px] text-fg-dim truncate max-w-[120px]">{r.name}</div>}
                </TableCell>
                <TableCell className="text-fg-dim text-[11px]">{r.sector}</TableCell>
                <TableCell className="text-right num">{formatCurrency(r.marketCap, { compact: true, decimals: 2 })}</TableCell>
                <TableCell className="text-right num">{formatNumber(r.peRatio, { decimals: 1 })}</TableCell>
                <TableCell className="text-right num">{formatNumber(r.psRatio, { decimals: 2 })}</TableCell>
                <TableCell className="text-right num">{formatNumber(r.evEbitda, { decimals: 1 })}</TableCell>
                <TableCell className="text-right num">{formatPercent(r.roe, { scale: "unit", signed: false })}</TableCell>
                <TableCell className="text-right num">{formatPercent(r.revenueGrowth, { scale: "unit" })}</TableCell>
                <TableCell className="text-right num">{formatPercent(r.dividendYield, { scale: "unit", signed: false })}</TableCell>
                <TableCell className="text-right num">{formatNumber(r.rsi14, { decimals: 0 })}</TableCell>
                <TableCell className="text-right num">{formatPercent(r.dist52wHigh, { scale: "unit", signed: false })}</TableCell>
                <TableCell>
                  <Link href={`/analyzer/${r.symbol}`}>
                    <Button size="sm" variant="outline">Analizar</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</label>
      <Input
        type="number"
        value={value ?? ""}
        step={step}
        className="h-8 num mt-0.5"
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</label>
      <div className="flex flex-wrap gap-1 mt-0.5 max-h-20 overflow-y-auto">
        {options.map((o) => {
          const selected = value.includes(o);
          return (
            <button
              key={o}
              onClick={() => onChange(selected ? value.filter((v) => v !== o) : [...value, o])}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                selected ? "border-pos/40 bg-pos/10 text-pos" : "border-border text-fg-dim hover:text-fg"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
