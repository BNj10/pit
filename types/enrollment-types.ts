export interface EnrollmentMeeting {
  days: readonly ("M" | "T" | "W" | "TH" | "F" | "S" | "SU")[];
  // Minutes after midnight, with start < end.
  start: number;
  end: number;
}

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
}
