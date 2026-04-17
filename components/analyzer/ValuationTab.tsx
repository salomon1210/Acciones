"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo, Explain } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricTile } from "@/components/analyzer/MetricTile";
import { formatCurrency, formatPercent, signClass } from "@/lib/utils/format";
import type { UnifiedFundamentals } from "@/lib/api/unified";

type DcfResult = {
  fairValuePerShare: number;
  enterpriseValue: number;
  upside: number | null;
  projectedFCF: number[];
  discountedFCF: number[];
  terminalValue: number;
  terminalDiscounted: number;
};

export function ValuationTab({
  symbol,
  fundamentals,
  currentPrice,
  analystTargetMean,
  analystTargetHigh,
  analystTargetLow,
}: {
  symbol: string;
  fundamentals: UnifiedFundamentals | null;
  currentPrice: number | null;
  analystTargetMean?: number | null;
  analystTargetHigh?: number | null;
  analystTargetLow?: number | null;
}) {
  const defaults = useMemo(() => {
    const fcf = fundamentals?.freeCashFlow ?? 0;
    const shares = fundamentals?.sharesOutstanding ?? 1;
    const netCash = ((fundamentals?.totalCash ?? 0) - (fundamentals?.totalDebt ?? 0)) / Math.max(1, shares);
    return {
      fcf: Math.round(fcf),
      shares: Math.round(shares),
      netCashPerShare: Number(netCash.toFixed(2)),
      growthY1: 8,
      growthY2: 7,
      growthY3: 6,
      growthY4: 5,
      growthY5: 4,
      terminalGrowth: 2.5,
      discountRate: 9,
    };
  }, [fundamentals]);

  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState<DcfResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function runDcf() {
    setError(null);
    const body = {
      freeCashFlow: form.fcf,
      sharesOutstanding: form.shares,
      growthRates: [form.growthY1, form.growthY2, form.growthY3, form.growthY4, form.growthY5].map((g) => g / 100),
      terminalGrowth: form.terminalGrowth / 100,
      discountRate: form.discountRate / 100,
      netCashPerShare: form.netCashPerShare,
      currentPrice,
    };
    try {
      const res = await fetch("/api/dcf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        setError("No pude calcular el DCF. Verificá que el backend Python esté corriendo en el puerto 8001.");
        return;
      }
      const data = (await res.json()) as DcfResult;
      setResult(data);
    } catch {
      setError("Error al conectar con el backend. Revisá que esté corriendo en localhost:8001.");
    }
  }

  const peerRows = useMemo(() => {
    const rows: Array<{ label: string; value: number | null; peerMedian: number; term: string }> = [
      { label: "P/E", term: "pe", value: fundamentals?.peRatio ?? null, peerMedian: 18 },
      { label: "P/B", term: "pb", value: fundamentals?.pbRatio ?? null, peerMedian: 3 },
      { label: "P/S", term: "ps", value: fundamentals?.psRatio ?? null, peerMedian: 2 },
      { label: "EV/EBITDA", term: "evebitda", value: fundamentals?.evEbitda ?? null, peerMedian: 13 },
    ];
    return rows;
  }, [fundamentals]);

  return (
    <div className="space-y-4">
      <Criollo>
        Valuation es la pregunta: &ldquo;¿está cara, barata o en precio?&rdquo;. El DCF estima cuánto valdría hoy basado en la plata que la empresa generará en los próximos 10 años.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Explain term="dcf">DCF interactivo</Explain>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <LabeledInput
              label="FCF actual (USD)"
              term="fcf"
              value={form.fcf}
              onChange={(v) => setForm((f) => ({ ...f, fcf: v }))}
              step={1_000_000}
            />
            <LabeledInput
              label="Acciones en circulación"
              value={form.shares}
              onChange={(v) => setForm((f) => ({ ...f, shares: v }))}
              step={1_000_000}
            />
            <LabeledInput
              label="Crecimiento año 1 (%)"
              value={form.growthY1}
              onChange={(v) => setForm((f) => ({ ...f, growthY1: v }))}
              step={0.5}
            />
            <LabeledInput
              label="Crecimiento año 2 (%)"
              value={form.growthY2}
              onChange={(v) => setForm((f) => ({ ...f, growthY2: v }))}
              step={0.5}
            />
            <LabeledInput
              label="Crecimiento año 3 (%)"
              value={form.growthY3}
              onChange={(v) => setForm((f) => ({ ...f, growthY3: v }))}
              step={0.5}
            />
            <LabeledInput
              label="Crecimiento año 4 (%)"
              value={form.growthY4}
              onChange={(v) => setForm((f) => ({ ...f, growthY4: v }))}
              step={0.5}
            />
            <LabeledInput
              label="Crecimiento año 5 (%)"
              value={form.growthY5}
              onChange={(v) => setForm((f) => ({ ...f, growthY5: v }))}
              step={0.5}
            />
            <LabeledInput
              label="Crecimiento perpetuo (%)"
              term="terminalvalue"
              value={form.terminalGrowth}
              onChange={(v) => setForm((f) => ({ ...f, terminalGrowth: v }))}
              step={0.25}
              hint="≤ PIB de largo plazo (2-3%)"
            />
            <LabeledInput
              label="Tasa de descuento (%)"
              term="wacc"
              value={form.discountRate}
              onChange={(v) => setForm((f) => ({ ...f, discountRate: v }))}
              step={0.25}
              hint="WACC razonable: 7-12%"
            />
            <LabeledInput
              label="Caja neta por acción"
              value={form.netCashPerShare}
              onChange={(v) => setForm((f) => ({ ...f, netCashPerShare: v }))}
              step={0.5}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => startTransition(runDcf)} disabled={pending}>
              {pending ? "Calculando..." : "Calcular fair value"}
            </Button>
            <Button variant="outline" onClick={() => setForm(defaults)}>
              Reset
            </Button>
          </div>

          {error && <p className="text-xs text-neg">{error}</p>}

          {result && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 pt-2">
              <MetricTile
                label={<><Explain term="fairvalue">Fair value</Explain> por acción</>}
                value={formatCurrency(result.fairValuePerShare, { decimals: 2 })}
              />
              <MetricTile
                label="Precio actual"
                value={formatCurrency(currentPrice ?? null, { decimals: 2 })}
              />
              <MetricTile
                label="Upside / (Downside)"
                value={
                  <span className={signClass(result.upside)}>
                    {formatPercent(result.upside, { scale: "unit" })}
                  </span>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Múltiplos vs peers (benchmarks sector)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead className="text-right num">{symbol}</TableHead>
                <TableHead className="text-right num">Peers (med)</TableHead>
                <TableHead className="text-right">Lectura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peerRows.map((r) => {
                const reading = r.value != null
                  ? r.value <= r.peerMedian * 0.8
                    ? { variant: "pos" as const, text: "barato" }
                    : r.value <= r.peerMedian * 1.2
                      ? { variant: "info" as const, text: "en línea" }
                      : { variant: "warn" as const, text: "premium" }
                  : null;
                return (
                  <TableRow key={r.label}>
                    <TableCell><Explain term={r.term}>{r.label}</Explain></TableCell>
                    <TableCell className="text-right num">{r.value != null ? r.value.toFixed(2) : "—"}</TableCell>
                    <TableCell className="text-right num text-fg-dim">{r.peerMedian.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {reading ? <Badge variant={reading.variant}>{reading.text}</Badge> : <span className="text-fg-dim">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Targets de analistas</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricTile label="Promedio" value={formatCurrency(analystTargetMean ?? null, { decimals: 2 })} />
          <MetricTile label="Máximo" value={formatCurrency(analystTargetHigh ?? null, { decimals: 2 })} />
          <MetricTile label="Mínimo" value={formatCurrency(analystTargetLow ?? null, { decimals: 2 })} />
        </CardContent>
      </Card>
    </div>
  );
}

function LabeledInput({
  label,
  term,
  value,
  onChange,
  step,
  hint,
}: {
  label: string;
  term?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-fg-muted">
        {term ? <Explain term={term}>{label}</Explain> : label}
      </label>
      <Input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 num"
      />
      {hint && <span className="text-[10px] text-fg-dim">{hint}</span>}
    </div>
  );
}
