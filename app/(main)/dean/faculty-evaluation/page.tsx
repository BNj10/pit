import type { Metadata } from "next";

import { EvaluationManagement } from "./components/evaluation-management";

export const metadata: Metadata = { title: "Faculty Evaluation | PIT Enroll" };

export default function FacultyEvaluationPage() {
  return <EvaluationManagement />;
}
