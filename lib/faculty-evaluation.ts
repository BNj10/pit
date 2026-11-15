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
  return new Date(`${value}+08:00`).getTime();
}

export function validateEvaluationWindow(window: EvaluationWindow) {
  const opens = evaluationTimestamp(window.opensAt);
  const closes = evaluationTimestamp(window.closesAt);
  if (!Number.isFinite(opens) || !Number.isFinite(closes)) {
    return "Enter a valid opening and closing date.";
  }
  return closes > opens ? null : "The closing date must be after the opening date.";
}

export function evaluationWindowStatus(
  window: EvaluationWindow,
  now: number,
): EvaluationWindowStatus {
  if (
    window.manuallyClosed ||
    validateEvaluationWindow(window) ||
    now >= evaluationTimestamp(window.closesAt)
  )
    return "Closed";
  return now < evaluationTimestamp(window.opensAt) ? "Scheduled" : "Open";
}

const windowDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatEvaluationDate(value: string) {
  const timestamp = evaluationTimestamp(value);
  return Number.isFinite(timestamp) ? windowDateFormatter.format(timestamp) : "—";
}

export function formatEvaluationScore(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

/**
 * Starting values for a new window: the semester after the previous window,
 * or the first semester of the current academic year. Dates are left for the
 * dean to choose.
 */
export function nextEvaluationWindowDraft(
  academicYears: readonly string[],
  currentAcademicYear: string | undefined,
  previous: EvaluationWindow | null,
): EvaluationWindow {
  const dates = { opensAt: "", closesAt: "", manuallyClosed: false };
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

export function instructorInitials(name: string) {
  const parts = name.replace(/^(Dr\.|Engr\.|Prof\.)\s+/i, "").split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`;
}
