"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  evaluationTermId,
  evaluationTermKey,
  evaluationWindowStatus,
  validateEvaluationWindow,
} from "@/lib/faculty-evaluation";
import { evaluationTermCompletion, summarizeEvaluationTerm } from "@/lib/faculty-evaluation-results";
import type {
  EvaluationContextValue,
  EvaluationSubmission,
  EvaluationWindow,
  EvaluationWindowStatus,
  FacultyEvaluationData,
} from "@/types/faculty-evaluation-types";

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

type EvaluationTerm = Pick<EvaluationWindow, "academicYear" | "semester">;

// This provider owns the in-memory UI workflow. Identity, persistence, and
// authoritative validation belong to the future authenticated server boundary.
export function EvaluationProvider({
  data,
  children,
}: {
  data: FacultyEvaluationData;
  children: ReactNode;
}) {
  const [window, setWindow] = useState<EvaluationWindow | null>(data.window);
  const [submissions, setSubmissions] = useState<readonly EvaluationSubmission[]>(
    data.submissions ?? [],
  );
  const [windowStatus, setStatus] = useState<EvaluationWindowStatus | null>(null);
  // Nothing accepts submissions until the first window is created.
  const status = window ? windowStatus : "Closed";
  // Terms whose window has closed in this session; their summaries are derived
  // from the latest submissions so the history row stays consistent.
  const [closedTerms, setClosedTerms] = useState<readonly EvaluationTerm[]>([]);
  // Hidden from the history list only; archived results keep all their data.
  const [archivedResultIds, setArchivedResultIds] = useState<readonly string[]>([]);
  const results = [
    ...closedTerms.map((term) => summarizeEvaluationTerm(data, term, submissions)),
    ...data.results.filter((result) =>
      closedTerms.every((term) => evaluationTermId(term) !== result.id),
    ),
  ];

  // A closed window moves its term into the history; reopening the same term
  // (by saving new dates) takes it back out.
  function applyStatus(next: EvaluationWindow, nextStatus: EvaluationWindowStatus) {
    setStatus(nextStatus);
    const term = { academicYear: next.academicYear, semester: next.semester };
    const key = evaluationTermKey(term);
    setClosedTerms((current) => {
      const listed = current.some((item) => evaluationTermKey(item) === key);
      if (nextStatus === "Closed") return listed ? current : [term, ...current];
      return listed ? current.filter((item) => evaluationTermKey(item) !== key) : current;
    });
  }

  useEffect(() => {
    if (!window) return;
    const update = () => applyStatus(window, evaluationWindowStatus(window, Date.now()));
    update();
    const timer = globalThis.setInterval(update, 1000);
    return () => globalThis.clearInterval(timer);
  }, [window]);

  function saveWindow(next: EvaluationWindow) {
    if (
      !data.academicYears.includes(next.academicYear) ||
      !["first", "second"].includes(next.semester)
    ) {
      return "Select an available academic year and semester.";
    }
    const error = validateEvaluationWindow(next);
    if (error) return error;
    setWindow(next);
    applyStatus(next, evaluationWindowStatus(next, Date.now()));
    return null;
  }

  function closeWindow() {
    if (!window) return "There is no evaluation window to close.";
    if (!evaluationTermCompletion(data, window, submissions).complete) {
      return "Evaluations can be closed once every faculty member has all student, Department Chair, and College Dean evaluations.";
    }
    const next = { ...window, manuallyClosed: true };
    setWindow(next);
    applyStatus(next, "Closed");
    // A term that was archived earlier is listed again once it closes anew.
    restoreResult(evaluationTermId(next));
    return null;
  }

  function archiveResult(resultId: string) {
    setArchivedResultIds((current) => current.includes(resultId) ? current : [...current, resultId]);
  }

  function restoreResult(resultId: string) {
    setArchivedResultIds((current) => current.includes(resultId) ? current.filter((id) => id !== resultId) : current);
  }

  function submitEvaluation(submission: EvaluationSubmission) {
    if (
      !window ||
      evaluationWindowStatus(window, Date.now()) !== "Open" ||
      submission.term !== evaluationTermKey(window)
    ) {
      return "This evaluation window is no longer open. Your answers have been kept here.";
    }
    if (!data.instructors.some((instructor) => instructor.id === submission.instructorId)) {
      return "This instructor is not available for evaluation.";
    }
    if (
      data.criteria.some(
        ({ id }) =>
          !Number.isInteger(submission.ratings[id]) ||
          submission.ratings[id] < 1 ||
          submission.ratings[id] > 5,
      )
    ) {
      return "Select a rating for every statement.";
    }
    if (
      submissions.some(
        (item) =>
          item.term === submission.term &&
          item.instructorId === submission.instructorId &&
          item.audience === submission.audience,
      )
    ) {
      return "You have already submitted this instructor's evaluation for this term.";
    }
    setSubmissions((current) =>
      current.some(
        (item) =>
          item.term === submission.term &&
          item.instructorId === submission.instructorId &&
          item.audience === submission.audience,
      )
        ? current
        : [...current, submission],
    );
    return null;
  }

  return (
    <EvaluationContext.Provider
      value={{
        data, window, status, submissions, results, archivedResultIds,
        saveWindow, closeWindow, archiveResult, restoreResult, submitEvaluation,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) throw new Error("Evaluation controls must be inside EvaluationProvider.");
  return context;
}
