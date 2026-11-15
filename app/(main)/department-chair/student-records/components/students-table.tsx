import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StudentsTableProps } from "@/types/student-records-exports";

export function StudentsTable({ students, recordsHref }: StudentsTableProps) {
  return (
    <Table
      className="student-records-table"
      aria-labelledby="student-records-title"
      containerProps={{
        className: "student-records-table-scroll",
        role: "region",
        "aria-label": "Students and academic records; scroll horizontally to view all columns",
        tabIndex: 0,
      }}
    >
      <colgroup>
        <col className="student-records-name-column" />
        <col className="student-records-email-column" />
        <col className="student-records-id-column" />
        <col className="student-records-year-column" />
        <col />
        <col className="student-records-action-column" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">STUDENT</TableHead>
          <TableHead scope="col">UNIVERSITY EMAIL</TableHead>
          <TableHead scope="col">STUDENT ID</TableHead>
          <TableHead scope="col">YEAR STANDING</TableHead>
          <TableHead scope="col">BATCH</TableHead>
          <TableHead scope="col">ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.studentNumber}>
            <TableHead scope="row">
              <div className="student-records-student">
                <Avatar className="student-records-avatar" aria-hidden="true">
                  <AvatarFallback className="student-records-avatar-fallback">{student.initials}</AvatarFallback>
                </Avatar>
                <span>{student.name}</span>
              </div>
            </TableHead>
            <TableCell className="student-records-muted student-records-email">{student.email}</TableCell>
            <TableCell className="student-records-muted">{student.studentNumber}</TableCell>
            <TableCell>{student.yearStanding}</TableCell>
            <TableCell>{student.batch}</TableCell>
            <TableCell>
              <Button variant="outline" className="student-records-records-button" asChild>
                <Link href={`${recordsHref}?student=${encodeURIComponent(student.studentNumber)}`} aria-label={`Records for ${student.name}`}>
                  <GraduationCap aria-hidden="true" />
                  Records
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {students.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="student-records-no-results">No students found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
