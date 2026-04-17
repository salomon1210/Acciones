"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/format";

type Snapshot = { takenAt: string; totalValue: number; pnlDay: number; pnlTotal: number };

export function PortfolioHistory() {
  const [data, setData] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio/snapshot")
      .then((r) => r.json())
      .then((d) => setData(d.snapshots ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="border border-border rounded-md p-4 bg-surface">
        <div className="text-xs text-fg-dim">Cargando histórico...</div>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="border border-border rounded-md p-4 bg-surface">
        <h3 className="text-xs uppercase tracking-wider text-fg-muted mb-2">Historial del portfolio</h3>
        <p className="text-xs text-fg-dim text-center py-6">
          Necesitás al menos 2 snapshots para ver la curva. Hacé clic en &quot;Guardar snapshot&quot; cada tanto (o dejalo automático en cron).
        </p>
      </div>
    );
  }

  const series = data.map((s) => ({
    x: new Date(s.takenAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    v: s.totalValue,
  }));

  return (
    <div className="border border-border rounded-md p-4 bg-surface">
      <h3 className="text-xs uppercase tracking-wider text-fg-muted mb-2">Evolución del portfolio</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={series}>
          <defs>
            <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D97E" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00D97E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" fontSize={10} tick={{ fill: "#8B92A0" }} axisLine={false} tickLine={false} />
          <YAxis fontSize={10} tick={{ fill: "#8B92A0" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true, decimals: 0 })} />
          <Tooltip
            contentStyle={{ background: "#111317", border: "1px solid #1C1F26", fontSize: 11, borderRadius: 6 }}
            formatter={(v: number) => [formatCurrency(v, { decimals: 2 }), "Valor"]}
          />
          <Area dataKey="v" stroke="#00D97E" strokeWidth={1.5} fill="url(#pgrad)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
