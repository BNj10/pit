import type { Metadata } from "next";

import { studentAccountPreview } from "@/types/student-account-mocks";
import { StudentAccountContent } from "./components/student-account-content";

export const metadata: Metadata = {
  title: "Student Account | University Portal",
};

export default function StudentAccountPage() {
  return <StudentAccountContent account={studentAccountPreview} />;
}
