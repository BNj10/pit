import { BookOpen, ClipboardCheck, PanelsTopLeft, UsersRound } from "lucide-react";

import { DashboardSummaryCard } from "@/components/shared/dashboard/dashboard-summary-card";
import type { DepartmentChairDashboardData } from "@/types/department-chair-dashboard-types";

export function DepartmentOverview({ data }: { data: DepartmentChairDashboardData }) {
  return (
    <section className="department-chair-dashboard-grid" aria-label="Department overview">
      <DashboardSummaryCard
        label="Student records"
        value={data.studentCount.toLocaleString("en-US")}
        description="Within your department"
        icon={<UsersRound strokeWidth={1.5} />}
      />
      <DashboardSummaryCard
        label="Pending enrollments"
        value={data.pendingEnrollmentCount.toLocaleString("en-US")}
        description="Awaiting your review"
        icon={<ClipboardCheck strokeWidth={1.5} />}
      />
      <DashboardSummaryCard
        label="Active sections"
        value={data.activeSectionCount.toLocaleString("en-US")}
        description="Current academic term"
        icon={<PanelsTopLeft strokeWidth={1.5} />}
      />
      <DashboardSummaryCard
        label="Active curricula"
        value={data.activeCurriculumCount.toLocaleString("en-US")}
        description="Available for management"
        icon={<BookOpen strokeWidth={1.5} />}
      />
    </section>
  );
}
