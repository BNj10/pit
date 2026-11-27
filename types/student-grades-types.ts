import type { RefObject } from "react";
import type { StudentRecordStudent } from "./student-records-types";

export type StudentGrade = number | "INC" | "DROP";
export type StudentGradeStatus = "PASSED" | "FAILED" | "INC" | "DROPPED";
export type GradePeriod = "midterm" | "final";

export interface StudentGradeSubject {
  code: string;
  title: string;
  midterm: StudentGrade | null;
  final: StudentGrade | null;
}

export interface StudentSemesterGrades {
  subjects: readonly StudentGradeSubject[];
}

export interface StudentGradeRecord {
  draft: StudentSemesterGrades;
  published: StudentSemesterGrades | null;
}

export interface StudentGradesSemester {
  value: string;
  label: string;
  schoolYearStatus: "current" | "completed";
}

export interface StudentGradesData {
  initialSemester: string;
  semesters: readonly StudentGradesSemester[];
  records: Readonly<Partial<Record<string, StudentGradeRecord>>>;
  /** Subjects the student is enrolled in for the current term; null when not enrolled. */
  enrolledSubjects: readonly Pick<StudentGradeSubject, "code" | "title">[] | null;
}

export interface StudentGradesContentProps {
  data: StudentGradesData;
  student: StudentRecordStudent;
  canCreateRecord?: boolean;
}

export interface GradesToolbarProps {
  semesters: readonly StudentGradesSemester[];
  selectedSemester: string;
  isReloading: boolean;
  onSemesterChange: (value: string) => void;
  onReload: () => void;
}

export interface EmptyGradeRecordProps {
  semester: StudentGradesSemester;
  onCreate?: () => void;
  /** Explains why a grade record couldn't be created, such as the student not being enrolled. */
  notice?: string;
}

export interface GradeDialogProps {
  period: GradePeriod;
  value: StudentGrade | null;
  onSave: (grade: StudentGrade) => void;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export interface SemesterGradesProps {
  record?: StudentGradeRecord;
  canEditRecord: boolean;
  isViewingDraft: boolean;
  isEditing: boolean;
  semester: StudentGradesSemester;
  onCreate?: () => void;
  createNotice?: string;
  onGradeChange: (code: string, period: GradePeriod, grade: StudentGrade) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onEdit: () => void;
  disabled: boolean;
}

export interface EditingStudentGrade {
  code: string;
  period: GradePeriod;
}
