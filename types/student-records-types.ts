export interface StudentRecordStudent {
  studentNumber: string;
  name: string;
  initials: string;
  email: string;
  yearStanding: string;
  batch: string;
}

export interface StudentRecordsData {
  department: string;
  pageSize: number;
  students: readonly StudentRecordStudent[];
}

export interface StudentRecordsContentProps {
  data: StudentRecordsData;
  recordsHref: string;
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
  /** Students added on this page that have no saved record to open yet. */
  addedStudentNumbers: ReadonlySet<string>;
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
  yearStandings: readonly string[];
  batches: readonly string[];
  onAdd: (student: StudentRecordStudent) => void;
}

export interface StudentRecordsPaginationProps {
  page: number;
  pageCount: number;
  visibleCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}
