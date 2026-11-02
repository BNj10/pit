"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { validateEvaluationSubmission } from "@/lib/instructor-evaluation";
import type { EvaluationDraft, InstructorEvaluationData, InstructorEvaluationSubject } from "@/types/instructor-evaluation-exports";

type InstructorEvaluationState = InstructorEvaluationData & {
  submitPreview: (subject: InstructorEvaluationSubject, draft: EvaluationDraft) => boolean;
};

const InstructorEvaluationContext = createContext<InstructorEvaluationState | null>(null);

export function InstructorEvaluationProvider({
  subjects, context, questionnaire, children,
}: InstructorEvaluationData & { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState(subjects);

  function submitPreview(subject: InstructorEvaluationSubject, draft: EvaluationDraft) {
    if (evaluations.find((item) => item.id === subject.id)?.evaluationStatus !== "pending") return false;
    const result = validateEvaluationSubmission(questionnaire, draft);
    if (!result.success) return false;
    setEvaluations((current) => current.map((item): InstructorEvaluationSubject => item.id === subject.id
      ? { ...item, evaluationStatus: "submitted" }
      : item));
    return true;
  }

  return (
    <InstructorEvaluationContext.Provider value={{
      subjects: evaluations, context, questionnaire, submitPreview,
    }}>
      {children}
    </InstructorEvaluationContext.Provider>
  );
}

export function useInstructorEvaluation() {
  const state = useContext(InstructorEvaluationContext);
  if (!state) throw new Error("Instructor evaluation pages must use InstructorEvaluationProvider.");
  return state;
}
