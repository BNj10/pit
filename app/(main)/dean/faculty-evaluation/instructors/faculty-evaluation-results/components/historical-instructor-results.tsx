"use client";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import HistoricalTermNotFound from "../../../historical-term-results/not-found";
import { FacultyEvaluationResults } from "./faculty-evaluation-results";

// Resolves closed terms from the client-side evaluation state, which also
// holds terms closed during this preview session.
export function HistoricalInstructorResults({ termId, instructorId }: { termId: string; instructorId: string }) {
  const { results } = useEvaluation();
  const term = results.find((item) => item.id === termId);
  const result = term?.instructorResults?.find((item) => item.instructor.id === instructorId);

  if (!term || !result) return <HistoricalTermNotFound />;
  return <FacultyEvaluationResults key={`${term.id}:${instructorId}`} instructor={result.instructor} historicalTerm={term} />;
}
