"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DepartmentStudent, DepartmentStudentsProps } from "@/types/college-management-types";
import { DirectoryPagination, DirectorySearch, DirectorySelect } from "../../../../../components/directory-controls";

function yearLabel(year: number) {
  const ordinal = new Intl.PluralRules("en", { type: "ordinal" }).select(year);
  const suffix = { one: "st", two: "nd", few: "rd", other: "th", zero: "th", many: "th" }[ordinal];
  return `${year}${suffix} Year`;
}

function exportStudents(students: readonly DepartmentStudent[], departmentCode: string) {
  // Quote every field and neutralize spreadsheet formulas in user-supplied cells.
  const cell = (value: string) => `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const rows = [
    ["Student", "University email", "Student ID", "Year standing", "Batch"],
    ...students.map((student) => [student.name, student.email, student.studentNumber, yearLabel(student.yearStanding), student.batch]),
  ];
  const url = URL.createObjectURL(new Blob(["\uFEFF", rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${departmentCode.replace(/[^a-z0-9_-]/gi, "_")}-students.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Design node h0cYPz. Counts and export reflect supplied records, not illustrative totals.
export function DepartmentStudents(props: DepartmentStudentsProps) {
  return <DepartmentStudentsContent key={props.department.id} {...props} />;
}

function DepartmentStudentsContent({ department, students, onViewAccount }: DepartmentStudentsProps) {
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("all");
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(1);
  const [exportStatus, setExportStatus] = useState("");
  // A future server loader must authorize the department before supplying records.
  const scoped = students.filter((student) => student.departmentId === department.id);
  const batches = [...new Set(scoped.map((student) => student.batch))].sort();
  const years = [...new Set(scoped.map((student) => student.yearStanding))].sort((a, b) => a - b);
  const query = search.trim().toLocaleLowerCase();
  const filtered = scoped.filter((student) => (batch === "all" || student.batch === batch)
    && (year === "all" || student.yearStanding.toString() === year)
    && `${student.name} ${student.email} ${student.studentNumber}`.toLocaleLowerCase().includes(query));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 7)));

  return (
    <main aria-labelledby="department-students-title" className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5"><h2 id="department-students-title" className="text-[28px] leading-tight font-bold">Students</h2><p className="text-sm text-muted-foreground">{department.name}</p></div>
        <Button type="button" disabled={filtered.length === 0} onClick={() => {
          try { exportStudents(filtered, department.code); setExportStatus(`Exported ${filtered.length} students.`); }
          catch { setExportStatus("Unable to export the list. Please try again."); }
        }} className="h-10 gap-2 rounded-md px-4 text-[13px] font-semibold"><Download aria-hidden="true" />Export list</Button>
      </header>
      <div className="flex flex-col justify-between gap-3 lg:flex-row">
        <div className="w-full lg:max-w-[420px]"><DirectorySearch label="Search students" placeholder="Search by name, email, or student number" value={search} onChange={(value) => { setSearch(value); setPage(1); }} /></div>
        <div className="flex flex-wrap gap-2.5">
          <DirectorySelect label="Filter by batch" value={batch} onChange={(value) => { setBatch(value); setPage(1); }} className="min-w-32 flex-1 sm:flex-none" options={[{ value: "all", label: "All batches" }, ...batches.map((value) => ({ value, label: value }))]} />
          <DirectorySelect label="Filter by year standing" value={year} onChange={(value) => { setYear(value); setPage(1); }} className="min-w-[148px] flex-1 sm:flex-none" options={[{ value: "all", label: "All year levels" }, ...years.map((value) => ({ value: value.toString(), label: yearLabel(value) }))]} />
        </div>
      </div>
      <section aria-label="Department students" className="overflow-hidden rounded-lg border border-border">
        <Table className="min-w-[1000px] table-fixed" containerProps={{ tabIndex: 0, role: "region", "aria-label": "Department students table", className: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" }}>
          <caption className="sr-only">Students in {department.name}</caption>
          <TableHeader><TableRow className="h-[42px] bg-muted hover:bg-muted">
            <TableHead scope="col" className="w-[24%] px-[18px] text-[10px] font-bold text-muted-foreground">STUDENT</TableHead>
            <TableHead scope="col" className="w-[26%] px-[18px] text-[10px] font-bold text-muted-foreground">UNIVERSITY EMAIL</TableHead>
            <TableHead scope="col" className="w-[16%] px-[18px] text-[10px] font-bold text-muted-foreground">STUDENT ID</TableHead>
            <TableHead scope="col" className="w-[17%] px-[18px] text-[10px] font-bold text-muted-foreground">YEAR STANDING</TableHead>
            <TableHead scope="col" className="px-[18px] text-[10px] font-bold text-muted-foreground">BATCH</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.slice((currentPage - 1) * 7, currentPage * 7).map((student) => <TableRow key={student.id} className="h-[72px]">
              <TableCell className="px-[18px]"><button type="button" onClick={() => onViewAccount(student.id)} aria-label={`View account for ${student.name}`} className="group flex min-h-11 w-full items-center gap-3 rounded-md text-left text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"><span aria-hidden="true" className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{student.initials}</span><span className="text-[13px] font-semibold whitespace-normal group-hover:underline">{student.name}</span></button></TableCell>
              <TableCell className="px-[18px] text-[11px] text-muted-foreground">{student.email}</TableCell>
              <TableCell className="px-[18px] text-xs text-muted-foreground">{student.studentNumber}</TableCell>
              <TableCell className="px-[18px] text-xs font-medium">{yearLabel(student.yearStanding)}</TableCell>
              <TableCell className="px-[18px] text-xs font-medium">{student.batch}</TableCell>
            </TableRow>)}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground"><span role="status">{scoped.length === 0 ? "No students are enrolled in this department." : "No students match your search or filters."}</span></TableCell></TableRow>}
          </TableBody>
        </Table>
        <DirectoryPagination page={currentPage} pageSize={7} total={filtered.length} noun="enrolled students" onPageChange={setPage} />
      </section>
      <p role="status" className="text-xs text-muted-foreground">{exportStatus}</p>
    </main>
  );
}
