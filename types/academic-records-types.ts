import type { ReactNode } from "react";

export interface AcademicRecordSubject {
  code: string;
  title: string;
  section: string;
  units: number;
  midterm: number | null;
  final: number | null;
  status: string;
}

export interface SemesterAcademicRecordData {
  id: string;
  title: string;
  term: string;
  gpa: number | null;
  subjects: readonly AcademicRecordSubject[];
}

export interface AcademicSemesterOption {
  value: string;
  label: string;
}

export interface AcademicSemesterGroup {
  year: string;
  semesters: readonly AcademicSemesterOption[];
}

export interface AcademicRecordsData {
  semesterGroups: readonly AcademicSemesterGroup[];
  initialSemesterValue: string;
  records: Readonly<Partial<Record<string, SemesterAcademicRecordData | null>>>;
}

export interface AcademicRecordsContentProps {
  semesterGroups: readonly AcademicSemesterGroup[];
  initialSemester: AcademicSemesterOption;
  records: Readonly<Partial<Record<string, ReactNode>>>;
}
