import type {
  AcademicCalendarChange,
  AcademicTerm,
  AcademicTermKind,
  AcademicTermRef,
  AcademicTermStatus,
  AcademicYear,
  AcademicYearFormValues,
  AcademicYearStatus,
} from "@/types/academic-calendar-types";

// Preview rules for the Dean's academic calendar. Terms have no dates: the
// Dean starts each term in order. Confirm with the institution before production.

export const academicTermOrder: readonly AcademicTermKind[] = ["first", "second", "summer"];

const termLabels: Record<AcademicTermKind, string> = {
  first: "1st semester",
  second: "2nd semester",
  summer: "Summer",
};

export function academicTermLabel(kind: AcademicTermKind) {
  return termLabels[kind];
}

export const academicTermStatusLabels: Record<AcademicTermStatus, string> = {
  upcoming: "Upcoming",
  current: "Current term",
  completed: "Completed",
};

export const academicYearStatusLabels: Record<AcademicYearStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

export function academicYearId(startYear: number) {
  return `${startYear}-${startYear + 1}`;
}

export function academicYearLabel(startYear: number) {
  return `${startYear}–${startYear + 1}`;
}

export function academicYearStart(year: Pick<AcademicYear, "id">) {
  return Number.parseInt(year.id, 10);
}

export function academicTermId(year: Pick<AcademicYear, "id">, kind: AcademicTermKind) {
  return `${year.id}:${kind}`;
}

/** e.g. "2nd semester · AY 2025–2026". */
export function academicTermRefLabel({ year, term }: Pick<AcademicTermRef, "year" | "term">) {
  return `${academicTermLabel(term.kind)} · AY ${year.label}`;
}

/** Every term of every academic year, newest year first, terms in order. */
export function listAcademicTerms(years: readonly AcademicYear[]): AcademicTermRef[] {
  return [...years]
    .sort((a, b) => academicYearStart(b) - academicYearStart(a))
    .flatMap((year) => year.terms.map((term) => ({ id: academicTermId(year, term.kind), year, term })));
}

export function findAcademicTerm(years: readonly AcademicYear[], termId: string) {
  return listAcademicTerms(years).find((item) => item.id === termId) ?? null;
}

function sortYears(years: readonly AcademicYear[]) {
  return [...years].sort((a, b) => academicYearStart(b) - academicYearStart(a));
}

function validStartYear(startYear: number) {
  return Number.isInteger(startYear) && startYear >= 2000 && startYear <= 2100;
}

/** A new Draft year with all three terms: 1st semester, 2nd semester, and Summer. */
export function createAcademicYear(
  values: AcademicYearFormValues,
  years: readonly AcademicYear[],
): AcademicCalendarChange {
  if (!validStartYear(values.startYear)) return { error: "Enter a valid starting year, such as 2028." };
  const id = academicYearId(values.startYear);
  if (years.some((year) => year.id === id)) return { error: `Academic year ${academicYearLabel(values.startYear)} already exists.` };
  const year: AcademicYear = {
    id,
    label: academicYearLabel(values.startYear),
    status: "draft",
    terms: academicTermOrder.map((kind): AcademicTerm => ({ kind, status: "upcoming" })),
  };
  return { years: sortYears([...years, year]) };
}

/** Changes which year a Draft academic year is; its terms stay the same. */
export function updateAcademicYear(
  yearId: string,
  values: AcademicYearFormValues,
  years: readonly AcademicYear[],
): AcademicCalendarChange {
  const year = years.find((item) => item.id === yearId);
  if (!year) return { error: "This academic year no longer exists." };
  if (year.status !== "draft") return { error: "Only a draft academic year can be edited." };
  if (!validStartYear(values.startYear)) return { error: "Enter a valid starting year, such as 2028." };
  const id = academicYearId(values.startYear);
  if (id !== year.id && years.some((item) => item.id === id)) {
    return { error: `Academic year ${academicYearLabel(values.startYear)} already exists.` };
  }
  const updated: AcademicYear = { ...year, id, label: academicYearLabel(values.startYear) };
  return { years: sortYears(years.map((item) => item.id === yearId ? updated : item)) };
}

/** Activates a Draft year; only one year can be active at a time. */
export function activateAcademicYear(yearId: string, years: readonly AcademicYear[]): AcademicCalendarChange {
  const year = years.find((item) => item.id === yearId);
  if (!year || year.status !== "draft") return { error: "Only a draft academic year can be activated." };
  const active = years.find((item) => item.status === "active");
  if (active) return { error: `Mark ${active.label} completed before activating ${year.label}.` };
  return { years: years.map((item) => item.id === yearId ? { ...item, status: "active" } : item) };
}

/**
 * Why the active year can't be marked completed yet, or null when it can:
 * Summer, the last term, must be the current term.
 */
export function academicYearCompletionBlocker(year: AcademicYear) {
  if (year.status !== "active") return "Only the active academic year can be completed.";
  if (year.terms.some((term) => term.kind === "summer" && term.status === "current")) return null;
  return `Start Summer for ${year.label} first. An academic year can be marked completed only while Summer is the current term.`;
}

/** Completes the active year while Summer is current; every term becomes Completed. */
export function completeAcademicYear(yearId: string, years: readonly AcademicYear[]): AcademicCalendarChange {
  const year = years.find((item) => item.id === yearId);
  if (!year) return { error: "This academic year no longer exists." };
  const blocker = academicYearCompletionBlocker(year);
  if (blocker) return { error: blocker };
  return {
    years: years.map((item) => item.id === yearId
      ? { ...item, status: "completed", terms: item.terms.map((term) => ({ ...term, status: "completed" })) }
      : item),
  };
}

/** The next term the Dean can start in an active year, if any. */
export function nextUpcomingTerm(year: AcademicYear) {
  return year.status === "active" ? year.terms.find((term) => term.status === "upcoming") ?? null : null;
}

/** Starts the next upcoming term of the active year; the current term is completed. */
export function startNextTerm(yearId: string, years: readonly AcademicYear[]): AcademicCalendarChange {
  const year = years.find((item) => item.id === yearId);
  if (!year || year.status !== "active") return { error: "Terms can be started only in the active academic year." };
  const next = nextUpcomingTerm(year);
  if (!next) return { error: `Every term of ${year.label} has started.` };
  const terms = year.terms.map((term): AcademicTerm =>
    term.kind === next.kind ? { ...term, status: "current" }
      : term.status === "current" ? { ...term, status: "completed" }
        : term);
  return { years: years.map((item) => item.id === yearId ? { ...item, terms } : item) };
}
