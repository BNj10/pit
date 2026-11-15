import Link from "next/link";
import { ChartColumn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { evaluationTermLabel } from "@/lib/faculty-evaluation";
import type { EvaluationInstructorResult, EvaluationTermResult } from "@/types/faculty-evaluation-types";

export function InstructorResultAction({
  result,
  term,
}: {
  result: EvaluationInstructorResult;
  term: EvaluationTermResult;
}) {
  const { instructor } = result;

  return (
    <Button
      asChild
      variant="outline"
      className="instructor-evaluation-action instructor-evaluation-submitted"
    >
      <Link
        href={{
          pathname: "/dean/faculty-evaluation/instructors/faculty-evaluation-results",
          query: { instructor: instructor.id, term: term.id },
        }}
        aria-label={`View results for ${instructor.name}, ${evaluationTermLabel(term)}`}
      >
        <ChartColumn aria-hidden="true" strokeWidth={1.5} />
        View Results
      </Link>
    </Button>
  );
}
