"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PortalLayout } from "./portal-layout";
import type { PortalRole, PortalUser } from "@/types/sidebar-types";

// Design preview data. Replace with the authenticated role, user, and active term.
const previewUsers: Record<PortalRole, PortalUser> = {
  student: {
    name: "Alyssa Mae Santos",
    description: "Student",
    initials: "AMS",
  },
  "department-chair": {
    name: "Alex Morgan",
    description: "Student records coordinator",
    initials: "AM",
  },
  dean: {
    name: "Alex Morgan",
    description: "Dean",
    initials: "AM",
  },
};

export function PortalRouteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const role: PortalRole =
    segment === "department-chair" || segment === "dean" ? segment : "student";

  return (
    <PortalLayout
      role={role}
      activeTerm="AY 2025–2026"
      user={previewUsers[role]}
    >
      {children}
    </PortalLayout>
  );
}
