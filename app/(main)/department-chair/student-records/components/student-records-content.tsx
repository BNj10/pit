"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { StudentRecordsContentProps } from "@/types/student-records-exports";

import { StudentRecordsFilters } from "./student-records-filters";
import { StudentRecordsPagination } from "./student-records-pagination";
import { StudentsTable } from "./students-table";

export function StudentRecordsContent({ data, recordsHref }: StudentRecordsContentProps) {
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

  return (
    <main className="student-records-content" data-page="student-records" aria-labelledby="student-records-title">
      <header className="student-records-introduction">
        <h1 id="student-records-title">Students</h1>
        <p>{data.department}</p>
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
