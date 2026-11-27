import { redirect } from "next/navigation";

import { studentRecordsHref } from "@/role-config";

import { StudentGradesLookup } from "./components/student-grades-lookup";

// The student is looked up in the shared preview state, which also holds students
// added during this session; the client shows a not-found state.
export default async function StudentGradesPage({ searchParams }: PageProps<"/department-chair/student-records/grades">) {
  const { student: studentNumber } = await searchParams;
  if (typeof studentNumber !== "string") redirect(studentRecordsHref);

  return <StudentGradesLookup studentNumber={studentNumber} />;
}
