import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/session";

export default async function DepartmentChairPortalLayout({ children }: { children: ReactNode }) {
  await requireRole("department-chair");

  return children;
}
