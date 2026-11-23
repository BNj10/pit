import type { Metadata } from "next";

import { InstructorEvaluationContent } from "./components/instructor-evaluation-content";

export const metadata: Metadata = {
  title: "Instructor Evaluation | University Portal",
};

export default function InstructorEvaluationPage() {
  return <InstructorEvaluationContent />;
}
