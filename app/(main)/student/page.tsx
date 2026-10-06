import type { Metadata } from "next";

import { StudentDashboard, type StudentDashboardData } from "./components/student-dashboard";

export const metadata: Metadata = {
  title: "Student Dashboard | University Portal",
};

// Preview data for the UI-only dashboard. Replace when backend data is connected.
const previewDashboard: StudentDashboardData = {
  studentStatus: "Regular",
  studentStatusDescription: "Load follows the prescribed curriculum",
  enrollmentStatus: "Returned",
  enrollmentStatusDescription: "Changes requested by the Department Chair",
  feedback: {
    message: "Please review your selected subjects. CS 302 overlaps with your laboratory schedule, and one prerequisite still needs confirmation before we can approve your enrollment.",
    returnedAt: "2026-05-28T10:04:00+08:00",
  },
};

export default function StudentPage() {
  return <StudentDashboard data={previewDashboard} />;
}
