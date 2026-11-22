import type { ReactNode } from "react";
import type { StudentGradeSubject } from "./student-grades-types";

export interface AcademicRecordSubject extends StudentGradeSubject {
  section: string;
  units: number;
}

export interface SemesterAcademicRecordData {
  id: string;
  title: string;
  term: string;
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
