import { notFound, redirect } from "next/navigation";

import { findStudentRecord } from "@/lib/student-records";
import { studentRecordsHref } from "@/role-config";
import { facultyGradesPreview } from "@/types/student-grades-exports";
import { studentRecordsPreview } from "@/types/student-records-exports";

import { StudentGradesContent } from "./components/student-grades-content";

export default async function StudentGradesPage({ searchParams }: PageProps<"/department-chair/student-records/grades">) {
  const { student: studentNumber } = await searchParams;
  if (studentNumber === undefined) redirect(studentRecordsHref);
  const student = findStudentRecord(studentRecordsPreview.students, studentNumber);
  if (!student) notFound();

  return <StudentGradesContent key={student.studentNumber} student={student} data={facultyGradesPreview} canCreateRecord />;
}
