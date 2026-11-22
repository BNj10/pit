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
}

export interface StudentRecordsPaginationProps {
  page: number;
  pageCount: number;
  visibleCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}
