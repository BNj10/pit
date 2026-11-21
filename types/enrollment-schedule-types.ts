import type { AcademicCalendarChange, AcademicYear, AcademicYearFormValues } from "./academic-calendar-types";

/** Who may enroll in a window: one year level, or open enrollment for remaining eligible students. */
export type EnrollmentGroup = "year-4" | "year-3" | "year-2" | "year-1" | "open";
export type EnrollmentWindowStatus = "scheduled" | "open" | "closed" | "paused";

export interface EnrollmentWindow {
  group: EnrollmentGroup;
  /** School time (Asia/Manila), "YYYY-MM-DDTHH:mm"; "" while not set. */
  opensAt: string;
  closesAt: string;
}

/** One term's school-wide enrollment schedule, set by a Dean. */
export interface EnrollmentSchedule {
  /** Academic term id, e.g. "2025-2026:second". */
  termId: string;
  /** The Dean's working copy, one window per group; students never see it. */
  draft: readonly EnrollmentWindow[];
  /**
   * The windows students see: only groups whose times were set when published.
   * A group without a published window has no enrollment yet. null until first published.
   */
  published: readonly EnrollmentWindow[] | null;
  /** Pauses every published window without changing its times. */
  paused: boolean;
}

export type EnrollmentWindowErrors = Partial<Record<EnrollmentGroup, string>>;

/** Why a schedule can't be published: per-window problems and, if any, one for the whole form. */
export interface EnrollmentPublishErrors {
  windows: EnrollmentWindowErrors;
  form?: string;
}

/** What one group's students get from a schedule. */
export interface EnrollmentGroupAccess {
  /** The group's window is published, so its students see when enrollment happens. */
  visible: boolean;
  /** The published window is open right now (and enrollment isn't paused). */
  canEnroll: boolean;
  window: EnrollmentWindow | null;
}

export interface EnrollmentManagementData {
  academicYears: readonly AcademicYear[];
  schedules: readonly EnrollmentSchedule[];
}

export interface EnrollmentManagementContextValue {
  academicYears: readonly AcademicYear[];
  schedules: readonly EnrollmentSchedule[];
  /** Current time, updated every second for live window statuses. */
  now: number;
  createAcademicYear: (values: AcademicYearFormValues) => AcademicCalendarChange;
  updateAcademicYear: (yearId: string, values: AcademicYearFormValues) => AcademicCalendarChange;
  activateAcademicYear: (yearId: string) => AcademicCalendarChange;
  completeAcademicYear: (yearId: string) => AcademicCalendarChange;
  startNextTerm: (yearId: string) => AcademicCalendarChange;
  createSchedule: (termId: string) => void;
  saveDraft: (termId: string, windows: readonly EnrollmentWindow[]) => void;
  /**
   * Publishes every group whose window is set; blank groups stay unpublished.
   * Returns errors when a window is incomplete or invalid, or none is set.
   */
  publishSchedule: (termId: string, windows: readonly EnrollmentWindow[]) => EnrollmentPublishErrors | null;
  setPaused: (termId: string, paused: boolean) => void;
}
