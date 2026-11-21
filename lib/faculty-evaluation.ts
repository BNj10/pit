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

export function evaluationTimestamp(value: string) {
  // The institution's timezone must not depend on the evaluator's device.
  // A bare day ("YYYY-MM-DD") means the start of that day in school time.
  const dateTime = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value;
  return new Date(`${dateTime}+08:00`).getTime();
}

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

const schoolDayParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in school time (Asia/Manila) as "YYYY-MM-DD", the format of a window's start day. */
export function currentEvaluationDay(now: number) {
  const parts = Object.fromEntries(
    schoolDayParts.formatToParts(now).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const windowDayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** A window's start day, e.g. "21 Nov 2026". */
export function formatEvaluationDay(value: string) {
  const timestamp = evaluationTimestamp(value);
  return Number.isFinite(timestamp) ? windowDayFormatter.format(timestamp) : "—";
}

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
