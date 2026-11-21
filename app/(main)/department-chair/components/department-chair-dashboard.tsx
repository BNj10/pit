import Link from "next/link";
import { UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { portalRoleConfig } from "@/role-config";
import type { DepartmentChairDashboardData } from "@/types/department-chair-dashboard-types";
import { DepartmentOverview } from "./department-overview";
import { DepartmentChairQuickAccess } from "./department-chair-quick-access";

const studentRecordsHref = portalRoleConfig["department-chair"].navigation.find(
  (item) => item.icon === "students",
)!.href;

export function DepartmentChairDashboard({ data }: { data: DepartmentChairDashboardData }) {
  return (
    <section className="department-chair-dashboard" aria-labelledby="department-chair-dashboard-title">
      <header className="department-chair-dashboard-heading">
        <div>
          <h2 id="department-chair-dashboard-title">Department Chair Dashboard</h2>
          <p>Review student records, enrollment activity, sections, and curricula.</p>
        </div>
        <Button asChild className="department-chair-dashboard-records-button">
          <Link href={studentRecordsHref}>
            <UsersRound aria-hidden="true" strokeWidth={1.5} />
            View student records
          </Link>
        </Button>
      </header>
      <DepartmentOverview data={data} />
      <DepartmentChairQuickAccess />
    </section>
  );
}
