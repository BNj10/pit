"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { isPortalPathActive } from "@/role-config";
import type { PortalProfileProps } from "@/types/sidebar-types";

export function PortalProfile({ user, account, onNavigate }: PortalProfileProps) {
  const pathname = usePathname();
  const active = isPortalPathActive(pathname, account.href);
  const initials = user.initials ?? user.name.trim().split(/\s+/).slice(0, 3).map((part) => part[0]).join("").toUpperCase();

  return (
    <Link
      href={account.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={`${account.label} — ${user.name}`}
      className={cn("flex shrink-0 items-center gap-2.5 border-t border-sidebar-border px-6 pt-3.5 pb-[18px] text-sidebar-foreground outline-sidebar-ring hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring", active && "bg-sidebar-accent")}
    >
      <Avatar className="size-9">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
        <AvatarFallback className="bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] leading-4 font-semibold">{user.name}</span>
        <span className="truncate text-[11px] leading-[13px] text-sidebar-label">{user.description}</span>
      </span>
    </Link>
  );
}
