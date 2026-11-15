import type { StudentRecordStudent } from "@/types/student-records-types";

export function findStudentRecord(
  students: readonly StudentRecordStudent[],
  studentNumber: string | string[] | undefined,
) {
  // Resolve only an exact fixture identity; never fall back to another student.
  if (typeof studentNumber !== "string") return undefined;
  return students.find((student) => student.studentNumber === studentNumber);
}
