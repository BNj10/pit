import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DashboardQuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  className?: string;
}

export function DashboardQuickActionCard({
  title,
  description,
  href,
  icon,
  className,
}: DashboardQuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-[18px] transition-colors hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <span aria-hidden="true" className="shrink-0 text-primary [&_svg]:size-[21px]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-foreground">{title}</span>
        <span className="mt-[5px] block text-[10px] leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-primary" />
    </Link>
  );
}
