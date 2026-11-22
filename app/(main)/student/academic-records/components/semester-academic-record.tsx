import type { SemesterAcademicRecordData } from "@/types/academic-records-exports";

import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Laid out like the Department Chair's Semester Grades. Grades and status are
// shown as published; a grade that is not yet published reads PENDING.
export function SemesterAcademicRecord({
  id,
  term,
  gpa,
  subjects,
}: SemesterAcademicRecordData) {
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
              const status = subject.status.toUpperCase();
              return (
                <TableRow key={subject.code}>
                  <TableHead scope="row">{subject.code}</TableHead>
                  <TableCell className="academic-records-subject-title">{subject.title}</TableCell>
                  <TableCell className="academic-records-value">{subject.midterm?.toFixed(2) ?? "PENDING"}</TableCell>
                  <TableCell className="academic-records-value">{subject.final?.toFixed(2) ?? "PENDING"}</TableCell>
                  <TableCell className="academic-records-status" data-status={status}>{status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
