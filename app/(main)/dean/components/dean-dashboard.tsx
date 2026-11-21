import { Building2, ClipboardPenLine, GraduationCap, Network, Users } from "lucide-react";

import { DashboardQuickActionCard } from "@/components/shared/dashboard/dashboard-quick-action-card";
import { DashboardSummaryCard } from "@/components/shared/dashboard/dashboard-summary-card";
import { portalRoleConfig } from "@/role-config";
import type { DeanDashboardData } from "@/types/dean-dashboard-types";

const deanNavigation = portalRoleConfig.dean.navigation;
const collegesHref = deanNavigation.find((item) => item.icon === "colleges")!.href;
const evaluationsHref = deanNavigation.find((item) => item.icon === "faculty-evaluation")!.href;
const numberFormatter = new Intl.NumberFormat("en-US");

export function DeanDashboard({ data }: { data: DeanDashboardData }) {
  return (
    <div className="space-y-6">
      <div className="flex min-h-[70px] flex-col justify-center gap-[5px]">
        <h2 className="text-[28px] leading-[34px] font-bold">Dean Dashboard</h2>
        <p className="text-[13px] leading-4 text-muted-foreground">
          Monitor academic operations, institutional activity, and key administrative priorities.
        </p>
      </div>
      <section aria-label="School overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardSummaryCard
          label="Colleges"
          value={numberFormatter.format(data.collegeCount)}
          description="Active academic units"
          icon={<Building2 />}
        />
        <DashboardSummaryCard
          label="Departments"
          value={numberFormatter.format(data.departmentCount)}
          description="Across all colleges"
          icon={<Network />}
        />
        <DashboardSummaryCard
          label="Faculty members"
          value={numberFormatter.format(data.facultyCount)}
          description={`${numberFormatter.format(data.activeFacultyCount)} currently active`}
          icon={<Users />}
        />
        <DashboardSummaryCard
          label="Enrolled students"
          value={numberFormatter.format(data.enrolledStudentCount)}
          description={`Academic year ${data.academicYear}`}
          icon={<GraduationCap />}
        />
      </section>
      <nav aria-labelledby="dean-quick-actions" className="space-y-3.5">
        <h3 id="dean-quick-actions" className="text-base font-bold">Quick actions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardQuickActionCard
            title="Manage colleges & departments"
            description="Review academic structure and department assignments"
            href={collegesHref}
            icon={<Building2 />}
          />
          <DashboardQuickActionCard
            title="Faculty evaluations"
            description="Monitor evaluation progress and outstanding reviews"
            href={evaluationsHref}
            icon={<ClipboardPenLine />}
          />
        </div>
      </nav>
    </div>
  );
}
