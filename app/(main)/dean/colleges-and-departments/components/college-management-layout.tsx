"use client";

import { usePathname } from "next/navigation";
import { PortalLayout } from "@/components/shared/sidebar/portal-layout";
import { getCollegeManagementBreadcrumbs } from "@/lib/college-management-breadcrumbs";
import type { PortalLayoutProps } from "@/types/sidebar-types";
import { CollegeManagementProvider, useCollegeManagement } from "./college-management-provider";

export function CollegeManagementLayout(props: PortalLayoutProps) {
  return (
    <CollegeManagementProvider>
      <CollegeManagementLayoutContent {...props} />
    </CollegeManagementProvider>
  );
}

function CollegeManagementLayoutContent(props: PortalLayoutProps) {
  const pathname = usePathname();
  const { colleges, departments, editingDepartmentId } = useCollegeManagement();
  const breadcrumbs = getCollegeManagementBreadcrumbs(pathname, colleges, departments, editingDepartmentId);

  return <PortalLayout {...props} breadcrumbs={breadcrumbs} />;
}
