import type { Metadata } from "next";

import { departmentChairAccountPreview } from "@/types/department-chair-account-mocks";
import { DepartmentChairAccount } from "../components/department-chair-account";

export const metadata: Metadata = {
  title: "Edit Profile | PIT Enroll",
  description: "Update your Department Chair address and contact details.",
};

export default function EditDepartmentChairProfilePage() {
  return <DepartmentChairAccount academic={departmentChairAccountPreview.academic} editing />;
}
