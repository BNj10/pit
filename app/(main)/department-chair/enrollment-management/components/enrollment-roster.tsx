import { Eye, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enrollmentUnits, formatSubmittedAt, yearLevelLabel } from "@/lib/enrollment-review";
import type { EnrollmentRosterProps } from "@/types/enrollment-review-exports";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";

const formatCount = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

export function EnrollmentRoster({ enrollments, onOpen }: EnrollmentRosterProps) {
  return (
    <Table
      className="enrollment-roster-table"
      containerProps={{ tabIndex: 0, role: "region", "aria-label": "Department roster" }}
    >
      {/* Fixed column widths keep the layout steady as filters and pages change the rows. */}
      <colgroup>
        <col className="enrollment-col-student" />
        <col className="enrollment-col-program" />
        <col className="enrollment-col-year" />
        <col className="enrollment-col-submitted" />
        <col className="enrollment-col-subjects" />
        <col className="enrollment-col-units" />
        <col className="enrollment-col-status" />
        <col className="enrollment-col-action" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Student</TableHead>
          <TableHead scope="col">Program</TableHead>
          <TableHead scope="col">Year level</TableHead>
          <TableHead scope="col">Submitted</TableHead>
          <TableHead scope="col" className="enrollment-numeric">Subjects</TableHead>
          <TableHead scope="col" className="enrollment-numeric">Units</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col" className="enrollment-action">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => {
          const submitted = enrollment.status !== "not-submitted";
          const { student } = enrollment;
          return (
            <TableRow key={enrollment.id}>
              <TableHead scope="row" className="enrollment-student">
                <span>{student.name}</span>
                <span>{student.studentNumber}</span>
              </TableHead>
              <TableCell className="enrollment-strong">{student.program}</TableCell>
              <TableCell className="enrollment-muted">{yearLevelLabel(student.yearLevel)}</TableCell>
              <TableCell className="enrollment-muted">
                {enrollment.submittedAt ? formatSubmittedAt(enrollment.submittedAt) : <span aria-label="Not submitted">—</span>}
              </TableCell>
              <TableCell className="enrollment-numeric enrollment-strong">
                {submitted ? enrollment.subjects.length : <span aria-label="None">—</span>}
              </TableCell>
              <TableCell className="enrollment-numeric enrollment-strong">
                {submitted ? formatCount(enrollmentUnits(enrollment)) : <span aria-label="None">—</span>}
              </TableCell>
              <TableCell>
                <EnrollmentStatusBadge status={enrollment.status} />
                {enrollment.status === "approved" && <span className="enrollment-status-note">Awaiting signatures</span>}
              </TableCell>
              <TableCell className="enrollment-action">
                {!submitted ? (
                  <span className="enrollment-awaiting">Awaiting student</span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="enrollment-action-button"
                    aria-haspopup="dialog"
                    aria-label={`${enrollment.status === "returned" ? "View return for" : "Preview enrollment of"} ${student.name}`}
                    onClick={() => onOpen(enrollment)}
                  >
                    {enrollment.status === "returned" ? <MessageSquareText aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    {enrollment.status === "returned" ? "View return" : "Preview"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
