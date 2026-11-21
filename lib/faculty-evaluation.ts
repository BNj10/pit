import { currentSchoolDay, formatSchoolDay, schoolTimestamp } from "@/lib/school-time";
import type { EvaluationWindow, EvaluationWindowStatus } from "@/types/faculty-evaluation-types";

export function evaluationTermKey(window: Pick<EvaluationWindow, "academicYear" | "semester">) {
  return `${window.academicYear}:${window.semester}`;
}

/** Matches the URL-safe ids used by archived term results, e.g. "2024-2025-second". */
export function evaluationTermId(term: Pick<EvaluationWindow, "academicYear" | "semester">) {
  return `${term.academicYear.replace(/\D+/g, "-")}-${term.semester}`;
}

export function evaluationTermLabel(term: Pick<EvaluationWindow, "academicYear" | "semester">) {
  return `${term.semester === "first" ? "1st" : "2nd"} sem · ${term.academicYear}`;
}

/** School time (Asia/Manila); a bare day means the start of that day. */
export const evaluationTimestamp = schoolTimestamp;

export function validateEvaluationWindow(window: EvaluationWindow) {
  return Number.isFinite(evaluationTimestamp(window.opensAt)) ? null : "Choose the day evaluations start.";
}

/** Windows have no end date: they are Closed only when the dean closes them. */
export function evaluationWindowStatus(
  window: EvaluationWindow,
  now: number,
): EvaluationWindowStatus {
  if (window.manuallyClosed || validateEvaluationWindow(window)) return "Closed";
  return now < evaluationTimestamp(window.opensAt) ? "Scheduled" : "Open";
}

/** Today in school time as "YYYY-MM-DD", the format of a window's start day. */
export const currentEvaluationDay = currentSchoolDay;

/** A window's start day, e.g. "21 Nov 2026". */
export const formatEvaluationDay = formatSchoolDay;

export function formatEvaluationScore(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

/**
 * Starting values for a new window: the semester after the previous window,
 * or the first semester of the current academic year. The start day is left
 * for the caller to choose.
 */
export function nextEvaluationWindowDraft(
  academicYears: readonly string[],
  currentAcademicYear: string | undefined,
  previous: EvaluationWindow | null,
): EvaluationWindow {
  const dates = { opensAt: "", manuallyClosed: false };
  if (!previous) {
    return { academicYear: currentAcademicYear ?? academicYears.at(-1) ?? "", semester: "first", ...dates };
  }
  if (previous.semester === "first") {
    return { academicYear: previous.academicYear, semester: "second", ...dates };
  }
  const nextYear = academicYears[academicYears.indexOf(previous.academicYear) + 1];
  return nextYear
    ? { academicYear: nextYear, semester: "first", ...dates }
    : { academicYear: previous.academicYear, semester: previous.semester, ...dates };
}
