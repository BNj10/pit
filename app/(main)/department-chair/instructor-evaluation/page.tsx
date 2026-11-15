import type { Metadata } from "next";

import { departmentChairEvaluationPreviewDepartment } from "@/types/faculty-evaluation-mocks";
import { InstructorEvaluationList } from "./components/instructor-evaluation-list";

export const metadata: Metadata = {
  title: "Instructor Evaluation | PIT Enroll",
  description: "Evaluate the overall teaching performance of instructors in your department.",
};

export default function DepartmentChairInstructorEvaluationPage() {
  return <InstructorEvaluationList department={departmentChairEvaluationPreviewDepartment} />;
}
