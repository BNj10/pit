import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { facultyEvaluationPreview } from "@/types/faculty-evaluation-mocks";
import { SupervisorEvaluation } from "./components/supervisor-evaluation";

export const metadata: Metadata = {
  title: "Evaluate Faculty | PIT Enroll",
  description: "Supervisor’s evaluation of faculty using the prescribed five-point rating scale.",
};

export default async function EvaluateFacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ instructor?: string | string[] }>;
}) {
  const { instructor: instructorId } = await searchParams;
  const instructor = facultyEvaluationPreview.instructors.find((item) => item.id === instructorId);

  if (!instructor) notFound();

  return <SupervisorEvaluation key={instructor.id} instructor={instructor} />;
}
