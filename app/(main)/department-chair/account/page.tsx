import type { Metadata } from "next";

import { departmentChairAccountPreview } from "@/types/department-chair-account-mocks";
import { DepartmentChairAccount } from "./components/department-chair-account";

export const metadata: Metadata = {
  title: "Department Chair Account | PIT Enroll",
  description: "Your personal profile and contact information.",
};

export default function DepartmentChairAccountPage() {
  return <DepartmentChairAccount academic={departmentChairAccountPreview.academic} />;
}
