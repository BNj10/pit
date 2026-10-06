import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardSummaryCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  variant?: "metric" | "status";
  tone?: "default" | "destructive";
  className?: string;
}

export function DashboardSummaryCard({
  label,
  value,
  description,
  icon,
  variant = "metric",
  tone = "default",
  className,
}: DashboardSummaryCardProps) {
  const isStatus = variant === "status";
  const color = tone === "destructive" ? "text-destructive" : "text-primary";

  return (
    <Card
      className={cn(
        "min-w-0 flex-row items-center gap-3 rounded-lg border border-border bg-background p-[18px] ring-0",
        isStatus ? "gap-3.5" : "min-h-[124px]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px]",
          isStatus ? "size-[42px]" : "size-9 bg-primary-soft",
          color,
        )}
      >
        {icon}
      </span>
      <dl className="min-w-0 flex-1">
        <dt
          className={cn(
            "font-semibold",
            isStatus
              ? "text-[10px] font-bold tracking-wide text-muted-foreground uppercase"
              : "text-xs text-foreground",
          )}
        >
          {label}
        </dt>
        <dd className={isStatus ? "mt-1" : "mt-1.5"}>
          <span className={cn("block font-bold leading-tight break-words", isStatus ? "text-[22px]" : "text-3xl", color)}>
            {value}
          </span>
          <span className={cn("block text-[11px] leading-snug text-muted-foreground", isStatus ? "mt-1" : "mt-1.5")}>
            {description}
          </span>
        </dd>
      </dl>
    </Card>
  );
}
