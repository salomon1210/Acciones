import { Badge } from "@/components/ui/badge";
import { Explain } from "@/components/ui/explain";
import { cn } from "@/lib/utils";
import { ratioBadgeVariant, classifyRatio } from "@/lib/utils/format";

type Props = {
  label: React.ReactNode;
  term?: string; // glossary key
  value: React.ReactNode;
  hint?: string;
  assessment?: ReturnType<typeof classifyRatio>;
  className?: string;
};

export function MetricTile({ label, term, value, hint, assessment, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-md border border-border bg-surface-2/30 px-3 py-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          {term ? <Explain term={term}>{label}</Explain> : label}
        </div>
        {assessment && (
          <Badge variant={ratioBadgeVariant(assessment)} className="capitalize">
            {assessment}
          </Badge>
        )}
      </div>
      <div className="num text-sm text-fg">{value}</div>
      {hint && <div className="text-[10px] text-fg-dim">{hint}</div>}
    </div>
  );
}
