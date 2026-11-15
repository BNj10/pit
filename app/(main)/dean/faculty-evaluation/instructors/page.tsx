import type { Metadata } from "next";

import { InstructorRecords } from "./components/instructor-records";

export const metadata: Metadata = {
  title: "Instructor Evaluations | PIT Enroll",
  description: "Review and evaluate faculty in the current semester evaluation window.",
};

export default function InstructorsPage() {
  return <InstructorRecords />;
}
