"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Upload, Wallet, Camera } from "lucide-react";
import { PnLCard } from "@/components/portfolio/PnLCard";
import { AllocationDonut } from "@/components/portfolio/AllocationDonut";
import { PositionsTable } from "@/components/portfolio/PositionsTable";
import { PortfolioHistory } from "@/components/portfolio/PortfolioHistory";
import type { PortfolioSummary } from "@/lib/portfolio/types";

export function PortfolioClient({ initial }: { initial: PortfolioSummary }) {
  const [summary, setSummary] = useState<PortfolioSummary>(initial);
  const [loadingBinance, setLoadingBinance] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) return;
      const data = (await res.json()) as PortfolioSummary;
      setSummary(data);
    } catch {
      // swallow — will retry on next poll
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function syncBinance() {
    setLoadingBinance(true);
    try {
      const res = await fetch("/api/portfolio/binance", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No pude sincronizar con Binance");
      } else {
        toast.success(`Binance sincronizado: ${data.synced} posiciones.`);
        await refresh();
      }
    } catch {
      toast.error("Error conectando a Binance");
    } finally {
      setLoadingBinance(false);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingUpload(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/portfolio/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No pude importar el CSV");
      } else {
        toast.success(`Importé ${data.imported} posiciones.`);
        await refresh();
      }
    } finally {
      setLoadingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveSnapshot() {
    setLoadingSnapshot(true);
    try {
      const res = await fetch("/api/portfolio/snapshot", { method: "POST" });
      if (!res.ok) {
        toast.error("No pude guardar el snapshot");
      } else {
        toast.success("Snapshot guardado.");
      }
    } finally {
      setLoadingSnapshot(false);
    }
  }

  return (
    <div className="space-y-4">
      <Criollo>
        Tu portfolio en una pantalla: cuánto tenés, cuánto ganaste/perdiste (total y de hoy), cómo está diversificado, y el detalle de cada posición. Los precios se refrescan cada 60 segundos.
      </Criollo>

      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={syncBinance} disabled={loadingBinance}>
            {loadingBinance ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Wallet className="w-3.5 h-3.5 mr-1" />}
            Sincronizar Binance
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={loadingUpload}>
            {loadingUpload ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
            Importar CSV broker
          </Button>
          <Button size="sm" variant="outline" onClick={saveSnapshot} disabled={loadingSnapshot}>
            {loadingSnapshot ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
            Guardar snapshot
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <Badge variant="outline" className="ml-auto text-[10px]">
            {summary.positions.length} posiciones
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <PnLCard label="Valor total" value={summary.totalValue} />
        <PnLCard label="PnL total" value={summary.totalPnl} change={summary.totalPnl} changePct={summary.totalPnlPct} />
        <PnLCard label="PnL hoy" value={summary.dayPnl} change={summary.dayPnl} changePct={summary.dayPnlPct} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <AllocationDonut title="Por clase" data={summary.byClass} totalValue={summary.totalValue} />
        <AllocationDonut title="Por geografía" data={summary.byGeography} totalValue={summary.totalValue} />
        <AllocationDonut title="Por sector" data={summary.bySector} totalValue={summary.totalValue} />
      </div>

      <PositionsTable positions={summary.positions} />

      <PortfolioHistory />

      <Card>
        <CardContent className="p-3 text-[11px] text-fg-dim leading-relaxed">
          <strong className="text-fg">Importar CSV:</strong> el archivo debe tener columnas <code className="text-fg">symbol,quantity,avgCost,assetType,sector,geography,currency</code>.
          Usá <a href="/api/portfolio/broker-template" className="text-pos hover:underline">este template</a> como punto de partida.
        </CardContent>
      </Card>
    </div>
  );
}
