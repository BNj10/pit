"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DepartmentFacultyProps } from "@/types/college-management-types";
import { DirectorySearch } from "../../../../../components/directory-controls";

// Design node z8pgPN. Supply only server-authorized records; this filter is presentation only.
export function DepartmentFaculty(props: DepartmentFacultyProps) {
  return <DepartmentFacultyContent key={props.department.id} {...props} />;
}

function DepartmentFacultyContent({ department, faculty }: DepartmentFacultyProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const departmentName = department.name.replace(/ Department$/, "");
  const scoped = faculty.filter((member) => member.departmentId === department.id);
  const visible = scoped.filter((member) => `${member.name} ${member.academicRank}`.toLocaleLowerCase().includes(query));

  return (
    <main aria-labelledby="department-faculty-title" className="space-y-6">
      <header className="flex min-h-[62px] flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-[5px]">
          <h2 id="department-faculty-title" className="text-2xl leading-tight font-bold">{department.name}</h2>
          <p className="text-xs text-muted-foreground">Instructors assigned to this department. View-only directory; no evaluation actions.</p>
        </div>
      </header>
      <div className="w-full lg:max-w-[420px]">
        <DirectorySearch label={`Search ${departmentName} faculty`} placeholder={`Search ${departmentName} faculty…`} value={search} onChange={setSearch} />
      </div>
      <section aria-label={`${department.name} faculty directory`} className="overflow-hidden rounded-lg border border-border">
        <Table className="min-w-[680px] table-fixed" containerProps={{ tabIndex: 0, role: "region", "aria-label": "Department faculty table", className: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" }}>
          <caption className="sr-only">Instructors assigned to {department.name}. Read-only directory.</caption>
          <TableHeader><TableRow className="h-12 bg-muted hover:bg-muted">
            <TableHead scope="col" className="w-[40%] px-4 text-[10px] font-bold tracking-wide text-muted-foreground">FACULTY MEMBER</TableHead>
            <TableHead scope="col" className="w-[30%] px-4 text-[10px] font-bold tracking-wide text-muted-foreground">DEPARTMENT</TableHead>
            <TableHead scope="col" className="px-4 text-[10px] font-bold tracking-wide text-muted-foreground">DEPARTMENT RANKING</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {visible.map((member) => <TableRow key={member.id} className="h-[88px]">
              <TableCell className="px-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[10px] font-bold text-primary">{member.initials}</span><span className="text-xs font-semibold whitespace-normal">{member.name}</span></div></TableCell>
              <TableCell className="px-4 text-[11px] font-semibold whitespace-normal">{departmentName}</TableCell>
              <TableCell className="px-4 text-[11px] whitespace-normal">{member.academicRank}</TableCell>
            </TableRow>)}
            {visible.length === 0 && <TableRow><TableCell colSpan={3} className="h-28 text-center text-sm text-muted-foreground"><span role="status">{scoped.length === 0 ? "No instructors are assigned to this department." : "No faculty match your search."}</span></TableCell></TableRow>}
          </TableBody>
        </Table>
        <footer className="flex min-h-14 items-center gap-2 border-t border-border bg-muted px-4 py-3 text-[11px] text-muted-foreground"><Info aria-hidden="true" className="size-4 shrink-0" />Read-only faculty directory · {department.name}</footer>
      </section>
    </main>
  );
}
