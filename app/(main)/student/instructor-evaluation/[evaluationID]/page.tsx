import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { instructorEvaluationPreview } from "@/types/instructor-evaluation-exports";
import { CreateEvaluationContent } from "./components/create-evaluation-content";

export const metadata: Metadata = {
  title: "Create Instructor Evaluation | University Portal",
};

export default async function CreateEvaluationPage({
  params,
}: {
  params: Promise<{ evaluationID: string }>;
}) {
  const { evaluationID } = await params;
  // Keep existing course-code preview links working while new links use record IDs.
  const subject = instructorEvaluationPreview.subjects.find((item) => item.id === evaluationID || item.code === evaluationID);
  if (!subject) notFound();

  return <CreateEvaluationContent key={subject.id} evaluationID={subject.id} />;
}
