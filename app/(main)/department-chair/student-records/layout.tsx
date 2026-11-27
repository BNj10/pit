import type { ReactNode } from "react";

import { studentRecordsPreview } from "@/types/student-records-exports";

import { StudentRecordsProvider } from "./components/student-records-provider";

// Shares preview students across the Student Records list and grades pages.
export default function StudentRecordsLayout({ children }: { children: ReactNode }) {
  return <StudentRecordsProvider data={studentRecordsPreview}>{children}</StudentRecordsProvider>;
}
