"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import type { StudentRecordsContentProps, StudentRecordStudent } from "@/types/student-records-exports";

import { AddStudentDialog } from "./add-student-dialog";
import { StudentRecordsFilters } from "./student-records-filters";
import { StudentRecordsPagination } from "./student-records-pagination";
import { useStudentRecords } from "./student-records-provider";
import { StudentsTable } from "./students-table";

export function StudentRecordsContent({ recordsHref }: StudentRecordsContentProps) {
  const data = useStudentRecords();
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("all");
  const [yearStanding, setYearStanding] = useState("all");
  const [page, setPage] = useState(1);
  const batches = [...new Set(data.students.map((student) => student.batch))].sort();
  const yearStandings = [...new Set(data.students.map((student) => student.yearStanding))].sort();
  const query = search.trim().toLowerCase();
  const filteredStudents = data.students.filter((student) => (
    (batch === "all" || student.batch === batch) &&
    (yearStanding === "all" || student.yearStanding === yearStanding) &&
    [student.name, student.email, student.studentNumber].some((field) => field.toLowerCase().includes(query))
  ));
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / data.pageSize));
  const currentPage = Math.min(page, pageCount);
  const students = filteredStudents.slice((currentPage - 1) * data.pageSize, currentPage * data.pageSize);

  function addStudent(student: StudentRecordStudent) {
    data.addStudent(student);
    // New students are listed first, so the new one is at the top of page 1.
    setSearch("");
    setBatch("all");
    setYearStanding("all");
    setPage(1);
    toast.success(`${student.name} was added. An invitation was sent to ${student.email}.`);
  }

  return (
    <main className="student-records-content" data-page="student-records" aria-labelledby="student-records-title">
      <header className="student-records-heading">
        <div className="student-records-introduction">
          <h1 id="student-records-title">Students</h1>
          <p>{data.department}</p>
        </div>
        <AddStudentDialog students={data.students} onAdd={addStudent} />
      </header>
      <StudentRecordsFilters
        search={search}
        batch={batch}
        yearStanding={yearStanding}
        batches={batches}
        yearStandings={yearStandings}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onBatchChange={(value) => { setBatch(value); setPage(1); }}
        onYearStandingChange={(value) => { setYearStanding(value); setPage(1); }}
      />
      <Card className="student-records-card">
        <StudentsTable students={students} recordsHref={recordsHref} />
        <StudentRecordsPagination
          page={currentPage}
          pageCount={pageCount}
          visibleCount={students.length}
          totalCount={filteredStudents.length}
          onPageChange={(value) => setPage(Math.max(1, Math.min(value, pageCount)))}
        />
      </Card>
    </main>
  );
}
