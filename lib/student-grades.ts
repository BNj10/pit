import type { StudentGrade, StudentGradeStatus, StudentGradeSubject } from "@/types/student-grades-types";

export function getSubjectGradeResult(
  midterm: StudentGrade | null,
  final: StudentGrade | null,
): { grade: StudentGrade | null; status: StudentGradeStatus | null } {
  // A recorded withdrawal takes priority, including when the other period is INC.
  if (midterm === "DROP" || final === "DROP") {
    return { grade: "DROP", status: "DROPPED" };
  }
  if (midterm === "INC" || final === "INC") {
    return { grade: "INC", status: "INC" };
  }
  if (midterm === null || final === null) {
    return { grade: null, status: null };
  }

  const grade = (midterm + final) / 2;
  return { grade, status: grade <= 3 ? "PASSED" : "FAILED" };
}

export function getSemesterGpa(
  subjects: readonly Pick<StudentGradeSubject, "midterm" | "final">[],
): number | null {
  let total = 0;
  let count = 0;

  for (const subject of subjects) {
    const { grade } = getSubjectGradeResult(subject.midterm, subject.final);
    if (typeof grade === "number" && Number.isFinite(grade)) {
      total += grade;
      count += 1;
    }
  }

  return count > 0 ? total / count : null;
}
