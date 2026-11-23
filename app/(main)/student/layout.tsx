import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/session";

export default async function StudentPortalLayout({ children }: { children: ReactNode }) {
  await requireRole("student");

  return children;
}
