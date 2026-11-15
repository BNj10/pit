import type { SemesterAcademicRecordData } from "@/types/academic-records-exports";
import { getSemesterGpa, getSubjectGradeResult } from "@/lib/student-grades";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SemesterAcademicRecord({
  id,
  title,
  term,
  subjects,
}: SemesterAcademicRecordData) {
  const totalUnits = subjects.reduce((total, subject) => total + subject.units, 0);
  const gpa = getSemesterGpa(subjects);

  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0">
      <Card className="academic-records-record">
        <CardHeader className="academic-records-semester-header">
          <div className="academic-records-semester-copy">
            <h2 id={`${id}-title`} className="academic-records-semester-title">
              {title}
            </h2>
            <CardDescription className="academic-records-semester-dates">
              {term}
            </CardDescription>
          </div>
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
            "aria-label": `${title}: subjects and grades`,
            className: "academic-records-table-scroll",
          }}
        >
          <colgroup>
            <col className="academic-records-code-column" />
            <col />
            <col className="academic-records-section-column" />
            <col className="academic-records-units-column" />
            <col className="academic-records-grade-column" />
            <col className="academic-records-grade-column" />
            <col className="academic-records-status-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">CODE</TableHead>
              <TableHead scope="col">SUBJECT TITLE</TableHead>
              <TableHead scope="col">SECTION</TableHead>
              <TableHead scope="col" className="academic-records-numeric">UNITS</TableHead>
              <TableHead scope="col" className="academic-records-numeric">MIDTERM</TableHead>
              <TableHead scope="col" className="academic-records-numeric">FINALS</TableHead>
              <TableHead scope="col">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No subjects are recorded for this semester.</TableCell>
              </TableRow>
            )}
            {subjects.map((subject) => {
              const result = getSubjectGradeResult(subject.midterm, subject.final);
              return (
                <TableRow key={subject.code}>
                  <TableHead scope="row">
                    {subject.code}
                  </TableHead>
                  <TableCell className="academic-records-subject-title">
                    {subject.title}
                  </TableCell>
                  <TableCell className="academic-records-muted">{subject.section}</TableCell>
                  <TableCell className="academic-records-numeric academic-records-units">
                    {subject.units.toFixed(1)}
                  </TableCell>
                  {[subject.midterm, subject.final].map((grade, index) => (
                    <TableCell key={index} className="academic-records-numeric academic-records-muted">
                      {typeof grade === "number" ? grade.toFixed(2) : (grade ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="academic-records-status">
                    {result.status ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <CardFooter className="academic-records-record-footer">
          <p className="academic-records-total-units">
            TOTAL · {totalUnits} UNITS
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}

