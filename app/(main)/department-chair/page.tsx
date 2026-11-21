import type { Metadata } from "next";

import { departmentChairDashboardPreview } from "@/types/department-chair-dashboard-mocks";
import { DepartmentChairDashboard } from "./components/department-chair-dashboard";

export const metadata: Metadata = {
  title: "Department Chair Dashboard | University Portal",
  description: "Review department student records, enrollment activity, sections, and curricula.",
};

export default function DepartmentChairPage() {
  return <DepartmentChairDashboard data={departmentChairDashboardPreview} />;
}
