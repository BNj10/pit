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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { getActivePortalItem } from "@/role-config";
import { PortalLogout } from "./portal-logout";
import type { PortalNavigationIcon, PortalNavigationItem } from "@/types/sidebar-types";

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
  logoutLabel: string;
  onLogout?: () => void | Promise<void>;
  onNavigate?: () => void;
  className?: string;
}

export function PortalNavigation({
  label,
  items,
  logoutLabel,
  onLogout,
  onNavigate,
  className,
}: PortalNavigationProps) {
  const pathname = usePathname();
  const activeItem = getActivePortalItem(pathname, items);

  return (
    <nav aria-label={label} className={cn("px-3 py-5", className)}>
      <p className="mb-1 text-[10px] leading-3 font-semibold tracking-[0.06em] text-sidebar-label">
        {label}
      </p>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const Icon = navigationIcons[item.icon];
          const active = item.href === activeItem?.href;

          return (
            <SidebarMenuItem key={item.href}>
              <Link
                href={item.href}
                onNavigate={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[42px] items-center gap-3 rounded-lg px-3 text-[13px] leading-4 font-medium text-sidebar-foreground outline-sidebar-ring transition-colors",
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
