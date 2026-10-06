"use client";

import { X } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { portalRoleConfig } from "@/role-config";
import { PortalActiveTerm } from "./portal-active-term";
import { PortalBrand } from "./portal-brand";
import { PortalNavigation } from "./portal-navigation";
import { PortalProfile } from "./portal-profile";
import { PortalSupport } from "./portal-support";
import type { PortalSidebarProps } from "@/types/sidebar-types";

export function PortalSidebar({
  role,
  user,
  activeTerm,
  config = portalRoleConfig[role],
  onLogout,
  className,
}: PortalSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const closeNavigation = () => setOpenMobile(false);

  return (
    <Sidebar
      id="portal-navigation"
      collapsible={isMobile ? "offcanvas" : "none"}
      className={cn("hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:shrink-0", className)}
    >
      <div className="flex shrink-0 items-center pr-4 lg:pr-0">
        <PortalBrand audience={config.audience} href={config.navigation[0]?.href ?? "/"} onNavigate={closeNavigation} />
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeNavigation}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-sidebar-ring hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden"
        >
          <X aria-hidden="true" className="size-6" />
        </button>
      </div>
      <PortalActiveTerm activeTerm={activeTerm} />
      <SidebarContent>
        <PortalNavigation
          label={config.navigationLabel}
          items={config.navigation}
          account={config.account}
          logoutLabel={config.logoutLabel}
          onLogout={onLogout}
          onNavigate={closeNavigation}
          className={role === "student" ? "lg:py-6" : undefined}
        />
      </SidebarContent>
      <SidebarFooter className="gap-0 p-0">
        <PortalSupport support={config.support} onNavigate={closeNavigation} />
        <PortalProfile user={user} account={config.account} onNavigate={closeNavigation} />
      </SidebarFooter>
    </Sidebar>
  );
}
