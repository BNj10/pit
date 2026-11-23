import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/session";

export default async function DeanPortalLayout({ children }: { children: ReactNode }) {
  await requireRole("dean");

  return children;
}
