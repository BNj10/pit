"use client";

import Link from "next/link";
import { ArrowLeft, FileX2 } from "lucide-react";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { SupervisorEvaluation } from "@/components/shared/faculty-evaluation/supervisor-evaluation";
import { Button } from "@/components/ui/button";
import { evaluationTermKey } from "@/lib/faculty-evaluation";
import type { DepartmentChairEvaluationResultProps } from "@/types/faculty-evaluation-types";
import { InstructorEvaluationNotice } from "../../components/instructor-evaluation-notice";

const listHref = "/department-chair/instructor-evaluation";

export function ChairEvaluationResult({ instructor }: DepartmentChairEvaluationResultProps) {
  const { window, status, submissions } = useEvaluation();
  const term = window ? evaluationTermKey(window) : null;
  const submitted = submissions.some((item) =>
    item.term === term && item.instructorId === instructor.id && item.audience === "department-chair",
  );

  if (status === null) {
    return <p className="chair-evaluation-loading" role="status">Loading evaluation…</p>;
  }

  if (!submitted) {
    // Submissions live in client state, so a missing result is shown here instead of through notFound().
    return (
      <main className="chair-evaluation-page" aria-labelledby="chair-evaluation-missing-title">
        <InstructorEvaluationNotice
          icon={FileX2}
          titleId="chair-evaluation-missing-title"
          title="No submitted evaluation"
          description={`You haven’t submitted an evaluation for ${instructor.name} this term.`}
        >
          <Button asChild variant="outline">
            <Link href={listHref}><ArrowLeft aria-hidden="true" />Back to Instructor Evaluation</Link>
          </Button>
        </InstructorEvaluationNotice>
      </main>
    );
  }

  return (
    <SupervisorEvaluation
      instructor={instructor}
      audience="department-chair"
      title="Department Chair’s Evaluation of Faculty"
      listHref={listHref}
      listLabel="Instructor Evaluation"
    />
  );
}
