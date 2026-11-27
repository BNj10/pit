export interface StudentRecordStudent {
  studentNumber: string;
  name: string;
  initials: string;
  email: string;
  yearStanding: string;
  batch: string;
  /** The latest invitation, kept until the student finishes account setup. */
  invitation?: { sentAt: string };
}

export interface StudentRecordsData {
  department: string;
  pageSize: number;
  students: readonly StudentRecordStudent[];
}

export interface StudentRecordsContentProps {
  recordsHref: string;
}

/** Preview students shared by the Student Records list and grades pages. */
export interface StudentRecordsContextValue extends StudentRecordsData {
  /** Current time in milliseconds, updated periodically so invitations can expire on screen. */
  now: number;
  /** Adds the student and records that their invitation was sent. */
  addStudent: (student: StudentRecordStudent) => void;
  resendInvitation: (studentNumber: string) => void;
}

export interface StudentRecordsFiltersProps {
  search: string;
  batch: string;
  yearStanding: string;
  batches: readonly string[];
  yearStandings: readonly string[];
  onSearchChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onYearStandingChange: (value: string) => void;
}

export interface StudentsTableProps {
  students: readonly StudentRecordStudent[];
  recordsHref: string;
}

export interface NewStudentFormValues {
  name: string;
  email: string;
  studentNumber: string;
  yearStanding: string;
  batch: string;
}

export type NewStudentFormErrors = Partial<Record<keyof NewStudentFormValues, string>>;

export interface AddStudentDialogProps {
  students: readonly StudentRecordStudent[];
  onAdd: (student: StudentRecordStudent) => void;
}

export interface StudentRecordsPaginationProps {
  page: number;
  pageCount: number;
  visibleCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}
