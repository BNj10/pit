import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupervisorEvaluation } from "@/components/shared/faculty-evaluation/supervisor-evaluation";
import { departmentChairEvaluationPreviewDepartment, facultyEvaluationPreview } from "@/types/faculty-evaluation-mocks";

export const metadata: Metadata = {
  title: "Evaluate Instructor | PIT Enroll",
  description: "Department Chair’s evaluation of faculty using the prescribed five-point rating scale.",
};

export default async function DepartmentChairEvaluatePage({
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

  return (
    <SupervisorEvaluation
      key={instructor.id}
      instructor={instructor}
      audience="department-chair"
      title="Department Chair’s Evaluation of Faculty"
      listHref="/department-chair/instructor-evaluation"
      listLabel="Instructor Evaluation"
    />
  );
}
