"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  const currentItem = isPortalPathActive(pathname, config.account.href)
    ? config.account
    : isPortalPathActive(pathname, config.support.href)
      ? config.support
      : activeItem;
  const breadcrumbs = [
    { label: config.label, href: config.navigation[0]?.href ?? `/${sidebarProps.role}` },
    { label: currentItem?.label ?? config.label, href: currentItem?.href ?? pathname },
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

  const title = breadcrumbs[breadcrumbs.length - 1].label;

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
            {header ?? (
              <>
                <h1 className="sr-only">{title}</h1>
                <Breadcrumb>
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
          </header>
          <div id="portal-content" tabIndex={-1} className="page-container flex-1 outline-none">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
