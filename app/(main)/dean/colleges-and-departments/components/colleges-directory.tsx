"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CollegesDirectoryProps } from "@/types/college-management-types";
import { DirectorySearch, DirectorySelect } from "./directory-controls";
import { DirectoryIcon } from "./directory-icon";

// Design node fDgNC. The portal layout supplies navigation and breadcrumbs.
export function CollegesDirectory({ colleges, onAddCollege, onManageDepartments }: CollegesDirectoryProps) {
  const [search, setSearch] = useState("");
  const [collegeId, setCollegeId] = useState("all");
  const query = search.trim().toLocaleLowerCase();
  const visible = colleges.filter((college) => (collegeId === "all" || college.id === collegeId)
    && `${college.name} ${college.code} ${college.description}`.toLocaleLowerCase().includes(query));

  return (
    <main aria-labelledby="colleges-title" className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5"><h2 id="colleges-title" className="text-2xl leading-tight font-bold">Colleges</h2><p className="text-xs text-muted-foreground">Organize departments by college.</p></div>
        <Button type="button" onClick={onAddCollege} className="h-10 gap-2 rounded-md px-4 text-xs font-semibold"><Plus aria-hidden="true" />Add college</Button>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <DirectorySearch label="Search saved colleges" placeholder="Search saved colleges…" value={search} onChange={setSearch} />
        <DirectorySelect label="Filter colleges" value={collegeId} onChange={setCollegeId} className="sm:w-[220px]" options={[{ value: "all", label: "All colleges" }, ...colleges.map((college) => ({ value: college.id, label: college.name }))]} />
      </div>
      <p className="text-xs text-muted-foreground">Select a college to manage its departments</p>
      <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((college) => (
          <article key={college.id} className="flex min-h-[276px] min-w-0 flex-col gap-3.5 rounded-lg border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-3"><span className="flex size-[42px] items-center justify-center rounded-[7px] bg-primary-soft text-primary"><DirectoryIcon name={college.icon} className="size-[21px]" /></span><span className="text-[11px] font-semibold text-muted-foreground">{college.code}</span></div>
            <div className="flex-1 space-y-2"><h3 className="text-lg leading-[1.25] font-semibold">{college.name}</h3><p className="text-[11px] leading-relaxed text-muted-foreground">{college.description}</p></div>
            <button type="button" aria-label={`Manage departments in ${college.name}`} onClick={() => onManageDepartments(college.id)} className="flex min-h-11 items-center justify-between gap-2 border-t border-border pt-3.5 text-left text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Manage departments<ArrowRight aria-hidden="true" className="size-4" /></button>
          </article>
        ))}
      </div>
      {visible.length === 0 && <p role="status" className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">{colleges.length === 0 ? "No colleges have been added yet." : "No colleges match your search or filter."}</p>}
    </main>
  );
}
