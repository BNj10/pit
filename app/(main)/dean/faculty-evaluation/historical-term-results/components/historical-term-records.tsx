"use client";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { InstructorRecords } from "../../instructors/components/instructor-records";
import HistoricalTermNotFound from "../not-found";

// Terms closed during this preview session exist only in the client-side
// evaluation state, so the term is resolved here rather than on the server.
export function HistoricalTermRecords({ termId }: { termId?: string }) {
  const { results } = useEvaluation();
  const term = results.find((result) => result.id === (termId ?? results[0]?.id));

  if (!term) return <HistoricalTermNotFound />;
  return <InstructorRecords key={term.id} historicalTerm={term} />;
}
