import { enrollmentManagementPreview } from "@/types/enrollment-management-exports";
import { EnrollmentManagementProvider } from "./components/enrollment-management-provider";

// Both tabs share the preview calendar and schedules, so state survives switching tabs.
export default function DeanEnrollmentManagementLayout({ children }: LayoutProps<"/dean/enrollment-management">) {
  return <EnrollmentManagementProvider data={enrollmentManagementPreview}>{children}</EnrollmentManagementProvider>;
}
