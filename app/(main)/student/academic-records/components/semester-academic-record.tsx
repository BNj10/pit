import { getSemesterGpa, getSubjectGradeResult } from "@/lib/student-grades";
import type { SemesterAcademicRecordData } from "@/types/academic-records-exports";
import type { StudentGrade } from "@/types/student-grades-types";

import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatGrade(grade: StudentGrade | null) {
  if (grade === null) return "PENDING";
  return typeof grade === "number" ? grade.toFixed(2) : grade;
}

// Laid out like the Department Chair's Semester Grades, with status and GPA from
// the same grade helpers. A grade that is not yet published reads PENDING.
export function SemesterAcademicRecord({
  id,
  term,
  subjects,
}: SemesterAcademicRecordData) {
  const gpa = getSemesterGpa(subjects);

  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0">
      <Card className="academic-records-record">
        <CardHeader className="academic-records-semester-header">
          <h2 id={`${id}-title`} className="academic-records-semester-title">
            Semester Grades
            <span className="sr-only">, {term}</span>
          </h2>
          <dl className="academic-records-gpa">
            <dt>
              SEMESTER GPA
            </dt>
            <dd>
              <span aria-hidden={gpa === null}>{gpa?.toFixed(2) ?? "—"}</span>
              {gpa === null && <span className="sr-only">Not yet available</span>}
            </dd>
          </dl>
        </CardHeader>

        <Table
          aria-labelledby={`${id}-title`}
          className="academic-records-table"
          containerProps={{
            tabIndex: 0,
            role: "region",
            "aria-label": `${term}: subjects and grades`,
            className: "academic-records-table-scroll",
          }}
        >
          <colgroup>
            <col className="academic-records-code-column" />
            <col />
            <col className="academic-records-grade-column" />
            <col className="academic-records-grade-column" />
            <col className="academic-records-status-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">SUBJECT CODE</TableHead>
              <TableHead scope="col">SUBJECT TITLE</TableHead>
              <TableHead scope="col">MIDTERM GRADE</TableHead>
              <TableHead scope="col">FINALS GRADE</TableHead>
              <TableHead scope="col">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No subjects are recorded for this semester.</TableCell>
              </TableRow>
            )}
            {subjects.map((subject) => {
              const { status } = getSubjectGradeResult(subject.midterm, subject.final);
              return (
                <TableRow key={subject.code}>
                  <TableHead scope="row">{subject.code}</TableHead>
                  <TableCell className="academic-records-subject-title">{subject.title}</TableCell>
                  <TableCell className="academic-records-value">{formatGrade(subject.midterm)}</TableCell>
                  <TableCell className="academic-records-value">{formatGrade(subject.final)}</TableCell>
                  <TableCell className="academic-records-status" data-status={status ?? undefined}>{status ?? "PENDING"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
