import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-fg-dim",
        pos: "border-pos/40 bg-pos/10 text-pos",
        neg: "border-neg/40 bg-neg/10 text-neg",
        warn: "border-warn/40 bg-warn/10 text-warn",
        info: "border-info/40 bg-info/10 text-info",
        outline: "border-border bg-transparent text-fg-dim",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
