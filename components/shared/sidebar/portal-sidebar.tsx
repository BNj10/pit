"use client";

import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar";

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
  const { setOpenMobile } = useSidebar();
  const closeMobileSidebar = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="offcanvas" className={className}>
      <PortalBrand audience={config.audience} href={config.navigation[0]?.href ?? "/"} onNavigate={closeMobileSidebar} />
      <PortalActiveTerm activeTerm={activeTerm} />
      <SidebarContent>
        <PortalNavigation
          label={config.navigationLabel}
          items={config.navigation}
          logoutLabel={config.logoutLabel}
          onLogout={onLogout}
          onNavigate={closeMobileSidebar}
          className={role === "student" ? "py-6" : undefined}
        />
      </SidebarContent>
      <SidebarFooter className="gap-0 p-0">
        <PortalSupport support={config.support} onNavigate={closeMobileSidebar} />
        <PortalProfile user={user} account={config.account} onNavigate={closeMobileSidebar} />
      </SidebarFooter>
    </Sidebar>
  );
}
