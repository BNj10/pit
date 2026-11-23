import { BookOpen } from "lucide-react";

import { DashboardQuickActionCard } from "@/components/shared/dashboard/dashboard-quick-action-card";
import { portalRoleConfig } from "@/role-config";

const curriculaHref = portalRoleConfig["department-chair"].navigation.find(
  (item) => item.icon === "curricula",
)!.href;

// These links target the corresponding workspaces; this component owns no destination screens.
const quickActions = [
  {
    title: "Curricula & subjects",
    description: "Open curricula and subject assignments",
    href: curriculaHref,
    icon: BookOpen,
  },
];

export function DepartmentChairQuickAccess() {
  return (
    <nav className="department-chair-dashboard-quick-access" aria-labelledby="department-chair-quick-access-title">
      <h3 id="department-chair-quick-access-title">Quick access</h3>
      <div className="department-chair-dashboard-grid">
        {quickActions.map(({ icon: Icon, ...action }) => (
          <DashboardQuickActionCard key={action.href} {...action} icon={<Icon strokeWidth={1.5} />} />
        ))}
      </div>
    </nav>
  );
}
