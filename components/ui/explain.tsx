"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY, type GlossaryEntry } from "@/lib/glossary";
import { cn } from "@/lib/utils";

type Props = {
  term: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
  iconSize?: number;
  className?: string;
  // allow passing an ad-hoc definition when we don't want to pollute the glossary
  override?: Partial<GlossaryEntry>;
};

export function Explain({ term, children, iconSize = 12, className, override }: Props) {
  const entry = { ...(GLOSSARY[term as string] ?? {}), ...(override ?? {}) } as GlossaryEntry;
  const hasDefinition = Boolean(entry && (entry.short || entry.long));

  if (!hasDefinition) {
    return <span className={className}>{children ?? entry?.label ?? term}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 cursor-help border-b border-dotted border-fg-dim/50 hover:border-fg/80 transition-colors",
            className
          )}
        >
          {children ?? entry.label ?? term}
          <HelpCircle
            className="text-fg-dim/70 hover:text-fg transition-colors"
            style={{ width: iconSize, height: iconSize }}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-sm">
        <div className="space-y-1.5">
          <div className="font-semibold text-fg">{entry.label}</div>
          <p className="text-fg leading-snug">{entry.short}</p>
          {entry.long && (
            <p className="text-fg-dim leading-snug text-[11px]">{entry.long}</p>
          )}
          {entry.good && (
            <p className="text-pos text-[11px] leading-snug">
              <span className="text-fg-dim">Rango útil:</span> {entry.good}
            </p>
          )}
          {entry.example && (
            <p className="text-fg-dim text-[11px] italic leading-snug">Ej: {entry.example}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function Criollo({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-surface-2/40 px-3 py-2 text-xs text-fg-dim leading-relaxed">
      <span className="text-[10px] uppercase tracking-widest text-fg-muted mr-2">En criollo</span>
      {children}
    </div>
  );
}
