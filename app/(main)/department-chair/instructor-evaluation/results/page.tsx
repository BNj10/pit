import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { departmentChairEvaluationPreviewDepartment, facultyEvaluationPreview } from "@/types/faculty-evaluation-mocks";
import { ChairEvaluationResult } from "./components/chair-evaluation-result";

export const metadata: Metadata = {
  title: "Evaluation Results | PIT Enroll",
  description: "Your submitted evaluation of an instructor in your department.",
};

export default async function DepartmentChairEvaluationResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ instructor?: string | string[] }>;
}) {
  const { instructor: instructorId } = await searchParams;
  // Preview data: production must check the instructor against the chair's verified department.
  const instructor = facultyEvaluationPreview.instructors.find((item) =>
    item.id === instructorId && item.department === departmentChairEvaluationPreviewDepartment,
  );

  if (!instructor) notFound();

  return <ChairEvaluationResult key={instructor.id} instructor={instructor} />;
}
