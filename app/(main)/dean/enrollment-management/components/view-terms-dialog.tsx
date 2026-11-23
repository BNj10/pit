"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { academicTermLabel, academicTermStatusLabels } from "@/lib/academic-calendar";
import type { AcademicYear } from "@/types/enrollment-management-exports";

/** Read-only list of an academic year's terms and their statuses. */
export function ViewTermsDialog({ year }: { year: AcademicYear }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="dean-enrollment-row-action" aria-label={`View terms of ${year.label}`}>
          <CalendarDays aria-hidden="true" />
          View terms
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Terms of AY {year.label}</DialogTitle>
          <DialogDescription>Terms have no dates; each one was started by the Dean.</DialogDescription>
        </DialogHeader>
        <ul className="dean-enrollment-term-list">
          {year.terms.map((term) => (
            <li key={term.kind}>
              <span>{academicTermLabel(term.kind)}</span>
              <span className="dean-enrollment-term-status" data-status={term.status}>{academicTermStatusLabels[term.status]}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
