"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { validateEvaluationDraft, validateEvaluationSubmission } from "@/lib/instructor-evaluation";
import type { EvaluationDraft, InstructorEvaluationData, InstructorEvaluationSubject } from "@/types/instructor-evaluation-exports";

type InstructorEvaluationState = InstructorEvaluationData & {
  drafts: Partial<Record<string, EvaluationDraft>>;
  statusMessage: string;
  errorMessage: string;
  openEvaluation: (subject: InstructorEvaluationSubject) => void;
  changeDraft: (subject: InstructorEvaluationSubject, draft: EvaluationDraft) => void;
  saveDraft: (subject: InstructorEvaluationSubject, draft: EvaluationDraft) => void;
  submitPreview: (subject: InstructorEvaluationSubject, draft: EvaluationDraft) => boolean;
  clearFeedback: () => void;
};

const InstructorEvaluationContext = createContext<InstructorEvaluationState | null>(null);

export function InstructorEvaluationProvider({
  subjects, context, questionnaire, children,
}: InstructorEvaluationData & { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState(subjects);
  const [drafts, setDrafts] = useState<Partial<Record<string, EvaluationDraft>>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const storageKeys = useCallback((subject: InstructorEvaluationSubject) => [
    `pit-enroll:preview-evaluation:${encodeURIComponent(subject.id)}`,
    // Read earlier preview drafts without losing answers saved before IDs were added.
    `pit-enroll:preview-evaluation:${encodeURIComponent(context.term)}:${encodeURIComponent(subject.code)}:${encodeURIComponent(subject.instructor)}`,
  ] as const,
  [context.term]);

  const clearFeedback = useCallback(() => {
    setStatusMessage("");
    setErrorMessage("");
  }, []);

  const openEvaluation = useCallback((subject: InstructorEvaluationSubject) => {
    if (subject.evaluationStatus === "submitted" || drafts[subject.id]) return;
    let draft: EvaluationDraft = { ratings: {}, comments: "" };
    try {
      const [key, legacyKey] = storageKeys(subject);
      const saved = window.sessionStorage.getItem(key) ?? window.sessionStorage.getItem(legacyKey);
      if (saved !== null) {
        const result = validateEvaluationDraft(questionnaire, JSON.parse(saved));
        if (!result.success) throw new Error("Invalid saved draft");
        draft = result.data;
      }
    } catch {
      setErrorMessage("Your saved draft could not be loaded. You can start a new evaluation.");
    }
    setDrafts((current) => ({ ...current, [subject.id]: draft }));
  }, [drafts, questionnaire, storageKeys]);

  function changeDraft(subject: InstructorEvaluationSubject, draft: EvaluationDraft) {
    setDrafts((current) => ({ ...current, [subject.id]: draft }));
    setStatusMessage("");
  }

  function saveDraft(subject: InstructorEvaluationSubject, draft: EvaluationDraft) {
    clearFeedback();
    const result = validateEvaluationDraft(questionnaire, draft);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }
    try {
      window.sessionStorage.setItem(storageKeys(subject)[0], JSON.stringify(result.data));
      setStatusMessage("Draft saved for this browser tab. Reopen this subject to continue.");
    } catch {
      setErrorMessage("Your draft could not be saved. Your answers are still available while this page stays open.");
    }
  }

  function submitPreview(subject: InstructorEvaluationSubject, draft: EvaluationDraft) {
    if (evaluations.find((item) => item.id === subject.id)?.evaluationStatus !== "pending") return false;
    const result = validateEvaluationSubmission(questionnaire, draft);
    if (!result.success) {
      setErrorMessage("Rate every statement before submitting.");
      return false;
    }
    setErrorMessage("");
    try {
      for (const key of storageKeys(subject)) window.sessionStorage.removeItem(key);
    } catch {
      setErrorMessage("The preview was completed, but the saved draft could not be removed from this tab.");
    }
    setEvaluations((current) => current.map((item): InstructorEvaluationSubject => item.id === subject.id
      ? { ...item, evaluationStatus: "submitted" }
      : item));
    setStatusMessage("");
    return true;
  }

  return (
    <InstructorEvaluationContext.Provider value={{
      subjects: evaluations, context, questionnaire, drafts, statusMessage, errorMessage,
      openEvaluation, changeDraft, saveDraft, submitPreview, clearFeedback,
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
