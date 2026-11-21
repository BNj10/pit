export interface EnrollmentMeeting {
  days: readonly ("M" | "T" | "W" | "TH" | "F" | "S" | "SU")[];
  // Minutes after midnight, with start < end.
  start: number;
  end: number;
}

/**
 * Server-resolved for the signed-in student; one count per section (lecture and lab together).
 * available = capacity − students holding a slot (Pending review, Returned, Approved, Enrolled).
 * A slot this student already holds, e.g. while Returned, counts as available to them.
 * "reserved" when the student is outside the offering department and the Department Chair's
 * cross-department access is not open yet; opensAt null means own department only.
 */
export type EnrollmentSlots =
  | { status: "open"; available: number; capacity: number }
  /** opensAt: ISO 8601 with a +08:00 offset. */
  | { status: "reserved"; opensAt: string | null };

export interface EnrollmentOffering {
  id: string;
  code: string;
  title: string;
  department: string;
  section: string;
  rooms: string;
  lectureUnits: number;
  labUnits: number;
  meetings: readonly EnrollmentMeeting[];
  slots: EnrollmentSlots;
}

// Requirement failures must come from confirmed curriculum/academic-record data.
export interface EnrollmentRequirementIssue {
  offeringId: string;
  requiredSubjectCode: string;
  type: "prerequisite" | "corequisite";
  message: string;
}

export type EnrollmentValidationIssue =
  | { type: "requirements"; requirements: readonly EnrollmentRequirementIssue[] }
  | { type: "slots-full"; offerings: readonly EnrollmentOffering[] }
  | { type: "unit-limit"; totalUnits: number; unitLimit: number }
  | {
    type: "schedule-conflict";
    selected: EnrollmentOffering;
    existing: EnrollmentOffering;
    selectedMeeting: EnrollmentMeeting;
    existingMeeting: EnrollmentMeeting;
  };

export type EnrollmentDialogIssue = Exclude<EnrollmentValidationIssue, { type: "unit-limit" }>;

export interface EnrollmentData {
  term: string;
  unitLimit: number;
  offerings: readonly EnrollmentOffering[];
  initialEnrollmentIds: readonly string[];
  initialSelectedIds: readonly string[];
  requirementIssues?: readonly EnrollmentRequirementIssue[];
  /**
   * Preview only: offerings the submit action will report as filled by other students.
   * Replace with the submit action's response when enrollment is connected.
   */
  fullOnSubmitIds?: readonly string[];
}
