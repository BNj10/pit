import { notFound, redirect } from "next/navigation";

import { StudentGradesContent } from "@/app/(main)/department-chair/student-records/grades/components/student-grades-content";
import { findStudentRecord } from "@/lib/student-records";
import { getStudentRecordsHref } from "@/role-config";
import { facultyGradesPreview } from "@/types/student-grades-exports";
import { studentRecordsPreview } from "@/types/student-records-exports";

export default async function StudentGradesPage({ searchParams }: PageProps<"/dean/student-records/grades">) {
  const { student: studentNumber } = await searchParams;
  if (studentNumber === undefined) redirect(getStudentRecordsHref("dean"));
  const student = findStudentRecord(studentRecordsPreview.students, studentNumber);
  if (!student) notFound();

  return <StudentGradesContent key={student.studentNumber} student={student} data={facultyGradesPreview} />;
}
