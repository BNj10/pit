"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Enrollment schedule", href: "/dean/enrollment-management" },
  { label: "Academic years & terms", href: "/dean/enrollment-management/academic-years" },
] as const;

// Route tabs, so each view has its own URL and heading.
export function EnrollmentManagementTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Enrollment management sections" className="dean-enrollment-tabs">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
