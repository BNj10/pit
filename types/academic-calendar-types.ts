/** Terms of an academic year, in order. Terms have no dates; the Dean starts each one. */
export type AcademicTermKind = "first" | "second" | "summer";
export type AcademicTermStatus = "upcoming" | "current" | "completed";
export type AcademicYearStatus = "draft" | "active" | "completed";

export interface AcademicTerm {
  kind: AcademicTermKind;
  status: AcademicTermStatus;
}

/** A school year shared by the whole school and managed by a Dean. */
export interface AcademicYear {
  /** URL-safe id, e.g. "2025-2026". */
  id: string;
  /** Display label, e.g. "2025–2026". */
  label: string;
  status: AcademicYearStatus;
  terms: readonly AcademicTerm[];
}

/** One term of one academic year, e.g. the 2nd semester of 2025–2026. */
export interface AcademicTermRef {
  /** "<year id>:<term kind>", e.g. "2025-2026:second". */
  id: string;
  year: AcademicYear;
  term: AcademicTerm;
}

/** Result of an academic calendar change: the next years, or why it was refused. */
export type AcademicCalendarChange =
  | { years: readonly AcademicYear[]; error?: undefined }
  | { years?: undefined; error: string };

/** Every academic year has all three terms, so only the year itself is chosen. */
export interface AcademicYearFormValues {
  /** First calendar year, e.g. 2027 for "2027–2028". */
  startYear: number;
}
