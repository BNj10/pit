import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { facultyEvaluationPreview } from "@/types/faculty-evaluation-mocks";
import { FacultyEvaluationResults } from "./components/faculty-evaluation-results";
import { HistoricalInstructorResults } from "./components/historical-instructor-results";

export const metadata: Metadata = {
  title: "Faculty Evaluation Results | PIT Enroll",
  description: "Student SET, Department Chair SEF, and College Dean SEF results for the selected academic term.",
};

export default async function FacultyEvaluationResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ instructor?: string | string[]; term?: string | string[] }>;
}) {
  const { instructor: instructorId, term: termId } = await searchParams;
  if (typeof instructorId !== "string") notFound();

  if (termId !== undefined) {
    if (typeof termId !== "string") notFound();
    return <HistoricalInstructorResults termId={termId} instructorId={instructorId} />;
  }

  const instructor = facultyEvaluationPreview.instructors.find((item) => item.id === instructorId);
  if (!instructor) notFound();
  return <FacultyEvaluationResults key={instructor.id} instructor={instructor} />;
}
