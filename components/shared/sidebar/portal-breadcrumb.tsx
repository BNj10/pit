"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface PortalBreadcrumbOverride {
  pathname: string;
  label: string;
}

export const PortalBreadcrumbContext = createContext<
  ((override: PortalBreadcrumbOverride | null) => void) | null
>(null);

/**
 * Replaces the last breadcrumb, and the page's screen-reader heading, with a
 * readable label, such as a record's name in place of its URL id.
 */
export function PortalBreadcrumbLabel({ label }: { label: string }) {
  const setOverride = useContext(PortalBreadcrumbContext);
  const pathname = usePathname();

  useEffect(() => {
    setOverride?.({ pathname, label });
    return () => setOverride?.(null);
  }, [setOverride, pathname, label]);

  return null;
}
