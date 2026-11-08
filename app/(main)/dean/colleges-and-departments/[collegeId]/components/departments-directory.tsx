"use client";

import { useState } from "react";
import Image from "next/image";
import { GraduationCap, Info, Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DepartmentsDirectoryProps } from "@/types/college-management-types";
import { DirectoryPagination, DirectorySearch, DirectorySelect } from "../../components/directory-controls";
import { DirectoryIcon } from "../../components/directory-icon";

// Design node d2Uei. Callbacks carry the selected department ID to future routes.
export function DepartmentsDirectory(props: DepartmentsDirectoryProps) {
  return <DepartmentsDirectoryContent key={props.college.id} {...props} />;
}

function DepartmentsDirectoryContent({ college, departments, onCreateDepartment, onEditDepartment, onViewFaculty, onViewStudents }: DepartmentsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("default");
  const [page, setPage] = useState(1);
  const scoped = departments.filter((department) => department.collegeId === college.id);
  const query = search.trim().toLocaleLowerCase();
  const filtered = scoped.filter((department) => `${department.name} ${department.code}`.toLocaleLowerCase().includes(query));
  if (order !== "default") filtered.sort((a, b) => (order === "az" ? 1 : -1) * a.name.localeCompare(b.name));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 5)));

  return (
    <main aria-labelledby="departments-title" className="space-y-6">
      <header className="flex min-h-[62px] flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-[5px]"><h2 id="departments-title" className="text-2xl leading-tight font-bold">{college.name}</h2><p className="text-xs text-muted-foreground">Browse the departments below to access faculty and student information.</p></div>
        <Button type="button" onClick={onCreateDepartment} className="h-10 gap-2 rounded-md px-4 text-xs font-semibold"><Plus aria-hidden="true" />Create department</Button>
      </header>
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-[420px]">
          <DirectorySearch label="Search departments" placeholder="Search departments…" value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
        </div>
        <DirectorySelect label="Department order" value={order} onChange={(value) => { setOrder(value); setPage(1); }} className="w-full lg:w-[148px] lg:shrink-0" options={[{ value: "default", label: "Default order" }, { value: "az", label: "Name A–Z" }, { value: "za", label: "Name Z–A" }]} />
      </div>
      <section aria-label="Departments" className="overflow-hidden rounded-lg border border-border">
        <h3 className="flex h-12 items-center bg-primary-soft px-6 text-[11px] font-semibold tracking-wide text-primary">DEPARTMENTS</h3>
        <ul>
          {filtered.slice((currentPage - 1) * 5, currentPage * 5).map((department) => (
            <li key={department.id} className="flex min-h-[110px] flex-wrap items-center gap-[18px] border-t border-border px-4 py-5 md:px-6">
              <span className="flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-primary">
                {department.logoUrl ? <Image src={department.logoUrl} alt="" width={46} height={46} unoptimized className="size-full object-contain" /> : <DirectoryIcon name={department.icon} className="size-[22px]" />}
              </span>
              <h4 className="min-w-0 flex-1 basis-40 text-base font-semibold">{department.name}</h4>
              <div className="flex w-full gap-2 lg:w-[328px]">
                <Button type="button" variant="outline" onClick={() => onViewFaculty(department.id)} aria-label={`View faculty in ${department.name}`} className="h-10 flex-1 gap-2 rounded-md text-[13px]"><Users aria-hidden="true" className="text-muted-foreground" />Faculty</Button>
                <Button type="button" variant="outline" onClick={() => onViewStudents(department.id)} aria-label={`View students in ${department.name}`} className="h-10 flex-1 gap-2 rounded-md text-[13px]"><GraduationCap aria-hidden="true" className="text-muted-foreground" />Students</Button>
                <Button type="button" variant="outline" onClick={() => onEditDepartment(department.id)} aria-label={`Edit ${department.name}`} className="h-10 flex-1 gap-2 rounded-md text-[13px]"><Pencil aria-hidden="true" className="text-muted-foreground" />Edit</Button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && <p role="status" className="p-8 text-center text-sm text-muted-foreground">{scoped.length === 0 ? "No departments have been added to this college yet." : "No departments match your search."}</p>}
        <DirectoryPagination page={currentPage} pageSize={5} total={filtered.length} noun="departments" onPageChange={setPage} />
      </section>
      <p className="flex items-start gap-2.5 text-xs text-muted-foreground"><Info aria-hidden="true" className="size-4 shrink-0" />Choose Faculty or Students to browse records. Use Edit to update department details.</p>
    </main>
  );
}
