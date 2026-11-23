import type { Metadata } from "next";

import { EnrollmentSchedule } from "./components/enrollment-schedule";

export const metadata: Metadata = {
  title: "Enrollment Management | PIT Enroll",
  description: "Set the school-wide enrollment schedule for each academic term.",
};

export default function DeanEnrollmentSchedulePage() {
  return <EnrollmentSchedule />;
}
