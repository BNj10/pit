"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  Contact,
  FileText,
  LayoutDashboard,
  Library,
  MessageSquareCheck,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { getActivePortalItem, isPortalPathActive } from "@/role-config";
import { PortalLogout } from "./portal-logout";
import type { PortalNavigationIcon, PortalNavigationItem, PortalRoleConfig } from "@/types/sidebar-types";

const navigationIcons = {
  dashboard: LayoutDashboard,
  enrollment: ClipboardList,
  subjects: BookOpenCheck,
  records: FileText,
  evaluation: MessageSquareCheck,
  curricula: BookOpen,
  students: Contact,
  sections: Library,
  "enrollment-management": ClipboardCheck,
  colleges: Building2,
  "faculty-evaluation": ClipboardPenLine,
} satisfies Record<PortalNavigationIcon, typeof LayoutDashboard>;

interface PortalNavigationProps {
  label: string;
  items: readonly PortalNavigationItem[];
  account?: PortalRoleConfig["account"];
  logoutLabel: string;
  onLogout?: () => void | Promise<void>;
  onNavigate?: () => void;
  className?: string;
}

export function PortalNavigation({
  label,
  items,
  account,
  logoutLabel,
  onLogout,
  onNavigate,
  className,
}: PortalNavigationProps) {
  const pathname = usePathname();
  const activeItem = getActivePortalItem(pathname, items);
  const activeHref = account && isPortalPathActive(pathname, account.href) ? account.href : activeItem?.href;
  const links = [
    ...items.map((item) => ({ ...item, Icon: navigationIcons[item.icon], compactOnly: false })),
    ...(account ? [{ ...account, Icon: UserRound, compactOnly: true }] : []),
  ];

  return (
    <nav aria-label={label} className={cn("relative px-3 pt-7 pb-5 lg:py-5", className)}>
      <p className="absolute top-2 left-6 text-[10px] leading-3 font-semibold tracking-[0.06em] text-sidebar-label lg:static lg:mb-1">
        {label}
      </p>
      <SidebarMenu className="gap-1.5 lg:gap-1">
        {links.map((item) => {
          const { Icon } = item;
          const active = item.href === activeHref;

          return (
            <SidebarMenuItem key={item.href} className={item.compactOnly ? "lg:hidden" : undefined}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-lg px-3 text-[13px] leading-4 font-medium text-sidebar-foreground outline-sidebar-ring transition-colors lg:h-[42px]",
                  "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  active && "bg-sidebar-accent font-semibold",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-[19px] shrink-0", active ? "text-sidebar-foreground" : "text-sidebar-icon")} />
                <span className="truncate">{item.label}</span>
              </Link>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <PortalLogout label={logoutLabel} onLogout={onLogout} />
        </SidebarMenuItem>
      </SidebarMenu>
    </nav>
  );
}
