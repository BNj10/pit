import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { facultyEvaluationPreview } from "@/types/faculty-evaluation-mocks";
import { SupervisorEvaluation } from "@/components/shared/faculty-evaluation/supervisor-evaluation";

export const metadata: Metadata = {
  title: "Evaluate Faculty | PIT Enroll",
  description: "Dean’s evaluation of faculty using the prescribed five-point rating scale.",
};

export default async function EvaluateFacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ instructor?: string | string[] }>;
}) {
  const { instructor: instructorId } = await searchParams;
  const instructor = facultyEvaluationPreview.instructors.find((item) => item.id === instructorId);

  if (!instructor) notFound();

  return (
    <SupervisorEvaluation
      key={instructor.id}
      instructor={instructor}
      audience="dean"
      title="Dean’s Evaluation of Faculty"
      listHref="/dean/faculty-evaluation/instructors"
      listLabel="Instructors"
    />
  );
}
