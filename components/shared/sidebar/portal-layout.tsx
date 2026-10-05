"use client";

import { usePathname } from "next/navigation";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { getActivePortalItem, isPortalPathActive, portalRoleConfig } from "@/role-config";
import { PortalSidebar } from "./portal-sidebar";
import type { PortalLayoutProps } from "@/types/sidebar-types";

export function PortalLayout({
  children,
  header,
  defaultOpen = true,
  ...sidebarProps
}: PortalLayoutProps) {
  const pathname = usePathname();
  const config = sidebarProps.config ?? portalRoleConfig[sidebarProps.role];
  const activeItem = getActivePortalItem(pathname, config.navigation);
  const title = isPortalPathActive(pathname, config.account.href)
    ? config.account.label
    : isPortalPathActive(pathname, config.support.href)
      ? config.support.label
      : activeItem?.label ?? config.label;

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen} className="[--sidebar-width:17rem]!">
        <a href="#portal-content" className="sr-only fixed top-3 left-3 z-50 rounded-md bg-card px-4 py-2 text-foreground focus:not-sr-only">
          Skip to content
        </a>
        <PortalSidebar {...sidebarProps} />
        <SidebarInset className="min-w-0">
          <header className="flex min-h-[72px] shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-8">
            <SidebarTrigger className="size-9" />
            {header ?? <h1 className="text-xl font-semibold">{title}</h1>}
          </header>
          <div id="portal-content" tabIndex={-1} className="page-container flex-1 outline-none">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
