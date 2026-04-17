"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

type Props = {
  data: number[];
  height?: number;
  positive?: boolean;
};

export function Sparkline({ data, height = 36, positive }: Props) {
  if (!data || data.length < 2)
    return <div className="h-[36px] w-full bg-surface-2/40 rounded" />;
  const series = data.map((v, i) => ({ x: i, v }));
  const isUp = positive ?? series[series.length - 1].v >= series[0].v;
  const color = isUp ? "hsl(var(--pos))" : "hsl(var(--neg))";
  const id = `spark-${isUp ? "up" : "down"}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
