"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

const COLORS = ["#00D97E", "#5EA1FF", "#F5A524", "#F5455C", "#B56DFF", "#38E3E3", "#FFD166", "#8B92A0"];

type Slice = { name: string; value: number };

export function AllocationDonut({ title, data, totalValue }: { title: string; data: Record<string, number>; totalValue: number }) {
  const entries = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);

  if (entries.length === 0) {
    return (
      <div className="border border-border rounded-md p-4 bg-surface h-full">
        <h3 className="text-xs uppercase tracking-wider text-fg-muted mb-3">{title}</h3>
        <p className="text-xs text-fg-dim text-center py-10">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 bg-surface h-full">
      <h3 className="text-xs uppercase tracking-wider text-fg-muted mb-2">{title}</h3>
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={entries} innerRadius={40} outerRadius={65} paddingAngle={1} dataKey="value" stroke="none">
              {entries.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#111317", border: "1px solid #1C1F26", fontSize: 11, borderRadius: 6 }}
              formatter={(value: number, name: string) => [`${formatCurrency(value)} (${formatPercent(value / totalValue, { scale: "unit", signed: false })})`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] text-fg-muted">Total</div>
          <div className="num text-sm text-fg">{formatCurrency(totalValue, { compact: true, decimals: 2 })}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {entries.slice(0, 6).map((e, i) => (
          <div key={e.name} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-fg-dim truncate">{e.name}</span>
            </div>
            <span className="num text-fg">{formatPercent(e.value / totalValue, { scale: "unit", signed: false })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
