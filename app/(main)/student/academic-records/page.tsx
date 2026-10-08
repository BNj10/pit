import { academicRecordsPreview } from "@/types/academic-records-exports";

import { AcademicRecordsContent } from "./components/academic-records-content";
import { SemesterAcademicRecord } from "./components/semester-academic-record";

export default function AcademicRecordsPage() {
  const { semesterGroups, initialSemesterValue, records } = academicRecordsPreview;
  const initialSemester = semesterGroups
    .flatMap((group) => group.semesters)
    .find((semester) => semester.value === initialSemesterValue);

  if (!initialSemester) {
    throw new Error("Academic records must provide a valid initial semester.");
  }

  const renderedRecords = Object.fromEntries(
    Object.entries(records).map(([value, record]) => [
      value,
      record ? <SemesterAcademicRecord key={value} {...record} /> : null,
    ]),
  );

  return (
    <AcademicRecordsContent
      semesterGroups={semesterGroups}
      initialSemester={initialSemester}
      records={renderedRecords}
    />
  );
}
