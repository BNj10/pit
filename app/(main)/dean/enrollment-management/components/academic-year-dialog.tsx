"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { academicTermLabel, academicTermOrder, academicYearLabel, academicYearStart } from "@/lib/academic-calendar";
import type { AcademicYear } from "@/types/enrollment-management-exports";
import { useEnrollmentManagement } from "./enrollment-management-provider";

/** Creates an academic year, or changes the year of a draft one when `year` is given. Terms have no dates. */
export function AcademicYearDialog({ open, onOpenChange, year }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year?: AcademicYear;
}) {
  // Mount fresh content per opening so each starts from the saved values.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <AcademicYearDialogContent year={year} onClose={() => onOpenChange(false)} />}
    </Dialog>
  );
}

function AcademicYearDialogContent({ year, onClose }: { year?: AcademicYear; onClose: () => void }) {
  const { academicYears, createAcademicYear, updateAcademicYear } = useEnrollmentManagement();
  const id = useId();
  const latestStart = Math.max(...academicYears.map(academicYearStart), new Date().getFullYear() - 1);
  const [startYear, setStartYear] = useState(String(year ? academicYearStart(year) : latestStart + 1));
  const [error, setError] = useState("");
  const parsedStart = Number.parseInt(startYear, 10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = { startYear: parsedStart };
    const change = year ? updateAcademicYear(year.id, values) : createAcademicYear(values);
    if (change.error) {
      setError(change.error);
      return;
    }
    toast.success(year ? `Academic year ${academicYearLabel(parsedStart)} saved.` : `Academic year ${academicYearLabel(parsedStart)} created as a draft.`);
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-[460px]">
      <DialogHeader>
        <DialogTitle>{year ? `Edit academic year ${year.label}` : "Create academic year"}</DialogTitle>
        <DialogDescription>
          Terms have no dates. You start each term from Academic years &amp; terms when it begins.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate className="dean-enrollment-form">
        {error && <p role="alert" className="dean-enrollment-form-error">{error}</p>}
        <div className="dean-enrollment-field">
          <Label htmlFor={`${id}-start`}>Academic year</Label>
          <div className="dean-enrollment-year-input">
            <Input
              id={`${id}-start`}
              inputMode="numeric"
              maxLength={4}
              value={startYear}
              autoComplete="off"
              aria-describedby={`${id}-start-hint`}
              onChange={(event) => {
                setStartYear(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
            />
            <span aria-hidden="true">–</span>
            <span>{Number.isFinite(parsedStart) ? parsedStart + 1 : "—"}</span>
          </div>
          <p id={`${id}-start-hint`} className="dean-enrollment-hint">
            Enter the first year, e.g. 2028 for 2028–2029.
          </p>
        </div>
        <div className="dean-enrollment-field">
          <p id={`${id}-terms`} className="dean-enrollment-field-label">Terms</p>
          <ul aria-labelledby={`${id}-terms`} className="dean-enrollment-term-list">
            {academicTermOrder.map((kind) => (
              <li key={kind}>
                <span>{academicTermLabel(kind)}</span>
                <span className="dean-enrollment-hint">Included</span>
              </li>
            ))}
          </ul>
          <p className="dean-enrollment-hint">Every academic year has all three terms.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{year ? "Save changes" : "Create academic year"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
