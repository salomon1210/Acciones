import { formatCurrency, formatPercent, signClass } from "@/lib/utils/format";

export function PnLCard({
  label,
  value,
  change,
  changePct,
}: {
  label: string;
  value: number;
  change?: number;
  changePct?: number;
}) {
  return (
    <div className="border border-border rounded-md p-4 bg-surface flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="num text-2xl text-fg mt-1">{formatCurrency(value, { decimals: 2 })}</div>
      {change != null && changePct != null && (
        <div className={`num text-xs mt-1 ${signClass(change)}`}>
          {formatCurrency(change, { decimals: 2 })} ({formatPercent(changePct, { scale: "unit" })})
        </div>
      )}
    </div>
  );
}
