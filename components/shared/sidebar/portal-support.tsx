import Link from "next/link";
import { CircleHelp } from "lucide-react";

import type { PortalSupportLink } from "@/types/sidebar-types";

interface PortalSupportProps {
  support: PortalSupportLink;
  onNavigate?: () => void;
}

export function PortalSupport({ support, onNavigate }: PortalSupportProps) {
  return (
    <Link
      href={support.href}
      onClick={onNavigate}
      className="flex shrink-0 items-center gap-3 border-t border-sidebar-border px-6 py-4 text-sidebar-foreground outline-sidebar-ring hover:bg-sidebar-accent"
    >
      <CircleHelp aria-hidden="true" className="size-[18px] shrink-0 text-sidebar-icon" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] leading-4 font-semibold">{support.label}</span>
        {support.description && (
          <span className="text-[11px] leading-[13px] text-sidebar-label">{support.description}</span>
        )}
      </span>
    </Link>
  );
}
