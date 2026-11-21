export type EnrollmentStatus = "not-submitted" | "pending-review" | "returned" | "approved" | "enrolled";
export type EnrollmentTermKind = "first" | "second" | "summer";
export type EnrollmentClassType = "lecture" | "laboratory";
export type EnrollmentMeetingDay = "M" | "T" | "W" | "Th" | "F" | "Sa";
export type EnrollmentYearLevel = 1 | 2 | 3 | 4;

/** A Dean-created academic term in which students enroll. */
export interface EnrollmentTerm {
  id: string;
  academicYear: string;
  term: EnrollmentTermKind;
}

export interface EnrollmentMeeting {
  days: readonly EnrollmentMeetingDay[];
  /** 24-hour "HH:MM" Philippine time. */
  startTime: string;
  endTime: string;
  room: string;
}

/** The lecture or laboratory part of a subject the student chose. */
export interface EnrollmentClassPart {
  classType: EnrollmentClassType;
  units: number;
  meetings: readonly EnrollmentMeeting[];
}

/** A subject the student chose, in one section block; lecture and lab are enrolled together. */
export interface EnrollmentSubject {
  code: string;
  title: string;
  section: string;
  parts: readonly EnrollmentClassPart[];
}

export interface EnrollmentStudent {
  studentNumber: string;
  name: string;
  program: string;
  yearLevel: EnrollmentYearLevel;
}

export interface EnrollmentReturn {
  message: string;
  /** "YYYY-MM-DDTHH:MM" Philippine time. */
  returnedAt: string;
}

/** One student's enrollment in one academic term. */
export interface StudentEnrollment {
  id: string;
  termId: string;
  student: EnrollmentStudent;
  status: EnrollmentStatus;
  /** null until the student submits; "YYYY-MM-DDTHH:MM" Philippine time. */
  submittedAt: string | null;
  subjects: readonly EnrollmentSubject[];
  /** The latest return, kept so the chair can review it. */
  lastReturn: EnrollmentReturn | null;
}

export interface EnrollmentManagementData {
  department: string;
  terms: readonly EnrollmentTerm[];
  enrollments: readonly StudentEnrollment[];
}

export interface EnrollmentManagementProps {
  data: EnrollmentManagementData;
}

export interface EnrollmentRosterProps {
  enrollments: readonly StudentEnrollment[];
  onOpen: (enrollment: StudentEnrollment) => void;
}

export interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  /** "text" for roster rows, "pill" for the review dialog summary. */
  variant?: "text" | "pill";
}

export interface EnrollmentReviewDialogProps {
  enrollment: StudentEnrollment;
  onClose: () => void;
  onApprove: () => void;
  onReturn: (message: string) => void;
  onMarkEnrolled: () => void;
}
