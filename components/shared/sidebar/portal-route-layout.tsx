"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DeanAccountProvider, useDeanAccount } from "@/components/shared/account/dean-account-provider";
import { PortalLayout } from "./portal-layout";
import { CollegeManagementLayout } from "@/app/(main)/dean/colleges-and-departments/components/college-management-layout";
import { isPortalPathActive } from "@/role-config";
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
    description: "College Dean",
    initials: "AM",
  },
};

function DeanPortal({ children }: { children: ReactNode }) {
  const { user } = useDeanAccount();
  return <PortalLayout role="dean" activeTerm="AY 2025–2026" user={user}>{children}</PortalLayout>;
}

export function PortalRouteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const role: PortalRole =
    segment === "department-chair" || segment === "dean" ? segment : "student";
  const Layout = isPortalPathActive(pathname, "/dean/colleges-and-departments")
    ? CollegeManagementLayout
    : PortalLayout;

  if (role === "dean") {
    return (
      <DeanAccountProvider user={previewUsers.dean}>
        <DeanPortal>{children}</DeanPortal>
      </DeanAccountProvider>
    );
  }

  return (
    <Layout
      role={role}
      activeTerm="AY 2025–2026"
      user={previewUsers[role]}
    >
      {children}
    </Layout>
  );
}
