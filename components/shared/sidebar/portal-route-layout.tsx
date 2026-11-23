"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AccountProvider, useAccount } from "@/components/shared/account/account-provider";
import { logout } from "@/lib/auth/actions";
import { PortalLayout } from "./portal-layout";
import { CollegeManagementLayout } from "@/app/(main)/dean/colleges-and-departments/components/college-management-layout";
import { isPortalPathActive } from "@/role-config";
import type { AccountProfileDetails } from "@/types/account-types";
import { deanProfilePreview } from "@/types/dean-account-mocks";
import { departmentChairAccountPreview } from "@/types/department-chair-account-mocks";
import { studentAccountPreview } from "@/types/student-account-mocks";
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
    description: "Department Chair",
    initials: "AM",
  },
  dean: {
    name: "Alex Morgan",
    description: "College Dean",
    initials: "AM",
  },
};

// Portals with an account page keep saved profile edits in AccountProvider so
// the sidebar profile reflects them.
const previewProfiles: Partial<Record<PortalRole, AccountProfileDetails>> = {
  student: studentAccountPreview.profile,
  "department-chair": departmentChairAccountPreview.profile,
  dean: deanProfilePreview,
};

function AccountPortal({ role, children }: { role: PortalRole; children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAccount();
  // Colleges & Departments keeps its preview state and breadcrumbs in its own layout.
  const Layout = role === "dean" && isPortalPathActive(pathname, "/dean/colleges-and-departments")
    ? CollegeManagementLayout
    : PortalLayout;
  return (
    <Layout role={role} activeTerm="AY 2025–2026" user={user} onLogout={logout}>
      {children}
    </Layout>
  );
}

export function PortalRouteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const role: PortalRole =
    segment === "department-chair" || segment === "dean" ? segment : "student";

  const profile = previewProfiles[role];
  if (profile) {
    return (
      <AccountProvider key={role} user={previewUsers[role]} initialDetails={profile}>
        <AccountPortal role={role}>{children}</AccountPortal>
      </AccountProvider>
    );
  }

  return (
    <PortalLayout
      role={role}
      activeTerm="AY 2025–2026"
      user={previewUsers[role]}
      onLogout={logout}
    >
      {children}
    </PortalLayout>
  );
}
