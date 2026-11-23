import type { Metadata } from "next";

import { enrollmentManagementPreview } from "@/types/enrollment-review-exports";
import { EnrollmentManagement } from "./components/enrollment-management";

export const metadata: Metadata = {
  title: "Manage Enrollment | PIT Enroll",
  description: "Track student enrollment progress and review submitted subject lists.",
};

export default function EnrollmentManagementPage() {
  return <EnrollmentManagement data={enrollmentManagementPreview} />;
}
