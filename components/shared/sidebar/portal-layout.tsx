"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";

import { getActivePortalItem, isPortalPathActive, portalRoleConfig } from "@/role-config";
import { PortalBreadcrumbContext, type PortalBreadcrumbOverride } from "./portal-breadcrumb";
import { PortalSidebar } from "./portal-sidebar";
import { PortalHeader } from "./portal-header";
import type { PortalLayoutProps } from "@/types/sidebar-types";

export function PortalLayout({
  children,
  header,
  ...sidebarProps
}: PortalLayoutProps) {
  const pathname = usePathname();
  const [breadcrumbOverride, setBreadcrumbOverride] = useState<PortalBreadcrumbOverride | null>(null);
  const config = sidebarProps.config ?? portalRoleConfig[sidebarProps.role];
  const activeItem = getActivePortalItem(pathname, config.navigation);
  const currentItem = isPortalPathActive(pathname, config.account.href)
    ? config.account
    : isPortalPathActive(pathname, config.support.href)
      ? config.support
      : activeItem;
  const currentLabel = currentItem === activeItem
    ? activeItem?.breadcrumbLabel ?? activeItem?.label
    : currentItem?.label;
  const breadcrumbs = [
    { label: config.label, href: config.navigation[0]?.href ?? `/${sidebarProps.role}` },
    { label: currentLabel ?? config.label, href: currentItem?.href ?? pathname },
  ];

  if (currentItem) {
    const segments = pathname.split("/").filter(Boolean);
    const parentDepth = currentItem.href.split("/").filter(Boolean).length;

    for (let index = parentDepth; index < segments.length; index++) {
      breadcrumbs.push({
        label: segments[index].replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        href: `/${segments.slice(0, index + 1).join("/")}`,
      });
    }
  }

  // A page may name its own crumb; ignore a label left over from another path.
  if (breadcrumbOverride?.pathname === pathname) {
    breadcrumbs[breadcrumbs.length - 1].label = breadcrumbOverride.label;
  }

  const title = breadcrumbs[breadcrumbs.length - 1].label;

  return (
    <TooltipProvider>
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden [--sidebar-width:17rem]!">
        <a href="#portal-content" className="sr-only fixed top-3 left-3 z-50 rounded-md bg-card px-4 py-2 text-foreground focus:not-sr-only">
          Skip to content
        </a>
        <PortalSidebar {...sidebarProps} />
        <SidebarInset className="portal-shell min-h-0 min-w-0">
          <PortalHeader>
            {header ?? (
              <>
                <h1 className="sr-only">{title}</h1>
                <Breadcrumb className="hidden lg:block">
                  <BreadcrumbList>
                    {breadcrumbs.map((item, index) => (
                      <Fragment key={`${index}:${item.href}`}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link
                              href={item.href}
                              aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                              className={index === breadcrumbs.length - 1 ? "font-semibold text-foreground" : undefined}
                            >
                              {item.label}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </PortalHeader>
          <ScrollArea
            type="always"
            className="portal-scroll-region min-h-0 flex-1 [&>[data-slot=scroll-area-scrollbar]]:bg-card [&_[data-slot=scroll-area-thumb]]:bg-muted-foreground"
            viewportProps={{
              id: "portal-content",
              role: "region",
              "aria-label": `${title} content`,
              tabIndex: 0,
              className: "portal-scroll-viewport",
            }}
          >
            <div className="portal-page-content page-container">
              <PortalBreadcrumbContext.Provider value={setBreadcrumbOverride}>
                {children}
              </PortalBreadcrumbContext.Provider>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
