"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  corequisiteOptions,
  isSemester,
  prerequisiteOptions,
  semesterLabel,
  semesters,
  subjectCodeMaxLength,
  subjectFormValues,
  subjectTitleMaxLength,
  validateSubject,
  yearLevelLabel,
} from "@/lib/curriculum-subjects";
import type {
  CurriculumTerm,
  Subject,
  SubjectDetails,
  SubjectFormErrors,
  SubjectFormValues,
} from "@/types/curriculum-types";
import { RequisitePicker } from "./requisite-picker";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  /** All subjects of the curriculum, including the one being edited. */
  curriculumSubjects: readonly Subject[];
  yearLevels: number;
  /** Term preselected for a new subject: the one being viewed. */
  defaultTerm: CurriculumTerm;
  /** The subject being edited; omit to add one. */
  subject?: Subject;
  onSubmit: (details: SubjectDetails) => void;
}

export function SubjectFormDialog({ open, onOpenChange, onCloseAutoFocus, subject, ...formProps }: SubjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="curriculum-dialog subject-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="curriculum-dialog-header subject-dialog-header">
          <DialogTitle>{subject ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription className="sr-only">
            {subject ? `Update ${subject.code} in this curriculum.` : "Add a subject to this curriculum."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from fresh values. */}
        <SubjectForm key={subject?.id ?? "new"} subject={subject} {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

const fieldOrder = [
  ["code", "subject-code"],
  ["title", "subject-title"],
  ["term", "subject-year-level"],
  ["lectureUnits", "subject-lectureUnits"],
  ["laboratoryUnits", "subject-laboratoryUnits"],
  ["prerequisiteIds", "subject-prerequisites"],
  ["corequisiteIds", "subject-corequisites"],
] as const satisfies readonly (readonly [keyof SubjectFormErrors, string])[];

/** Lecture + laboratory units as text, or "" until both entries are numbers or blank. */
function unitTotal(values: Pick<SubjectFormValues, "lectureUnits" | "laboratoryUnits">) {
  const parts = [values.lectureUnits.trim(), values.laboratoryUnits.trim()];
  if (parts.every((part) => !part) || parts.some((part) => part && !/^\d+$/.test(part))) return "";
  return String(parts.reduce((total, part) => total + Number(part || 0), 0));
}

function SubjectForm({
  curriculumSubjects,
  yearLevels,
  defaultTerm,
  subject,
  onSubmit,
}: Omit<SubjectFormDialogProps, "open" | "onOpenChange" | "onCloseAutoFocus">) {
  const editing = subject !== undefined;
  const [values, setValues] = useState<SubjectFormValues>(() => subjectFormValues(subject, defaultTerm));
  const [errors, setErrors] = useState<SubjectFormErrors>({});
  const totalUnits = unitTotal(values);
  const others = curriculumSubjects.filter((item) => item.id !== subject?.id);
  const term: CurriculumTerm = { yearLevel: values.yearLevel, semester: values.semester };
  const prerequisites = prerequisiteOptions(others, term);
  const corequisites = corequisiteOptions(others, term);
  const ineligible = (ids: readonly string[], eligible: readonly Subject[]) =>
    others.filter((item) => ids.includes(item.id) && !eligible.includes(item));

  function update(change: Partial<SubjectFormValues>, cleared: (keyof SubjectFormErrors)[]) {
    setValues((current) => ({ ...current, ...change }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of cleared) delete next[field];
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateSubject(values, curriculumSubjects, yearLevels, subject?.id);
    setErrors(result.errors);
    if (!result.details) {
      const first = fieldOrder.find(([field]) => result.errors[field]);
      if (first) document.getElementById(first[1])?.focus();
      return;
    }
    onSubmit(result.details);
  }

  function describedBy(field: keyof SubjectFormErrors, help?: string) {
    return [help, errors[field] ? `subject-${field}-error` : ""].filter(Boolean).join(" ") || undefined;
  }

  function fieldError(field: keyof SubjectFormErrors) {
    return errors[field] ? (
      <p className="field-error" id={`subject-${field}-error`} role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  const unitField = (field: "lectureUnits" | "laboratoryUnits", label: string) => (
    <div className="curriculum-field">
      <label htmlFor={`subject-${field}`}>{label} <span aria-hidden="true">*</span></label>
      <Input
        id={`subject-${field}`}
        name={field}
        value={values[field]}
        inputMode="numeric"
        maxLength={2}
        autoComplete="off"
        required
        aria-invalid={Boolean(errors[field])}
        aria-describedby={describedBy(field, "subject-units-help")}
        // Clearing lectureUnits also clears the "both cannot be 0" message.
        onChange={(event) => update({ [field]: event.target.value }, [field, "lectureUnits"])}
      />
      {fieldError(field)}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div className="curriculum-dialog-body">
        <div className="subject-field-row subject-identity-row">
          <div className="curriculum-field">
            <label htmlFor="subject-code">Subject code <span aria-hidden="true">*</span></label>
            <Input
              id="subject-code"
              name="code"
              value={values.code}
              placeholder="e.g. CC 101"
              maxLength={subjectCodeMaxLength}
              autoComplete="off"
              spellCheck={false}
              required
              aria-invalid={Boolean(errors.code)}
              aria-describedby={describedBy("code")}
              onChange={(event) => update({ code: event.target.value }, ["code"])}
            />
            {fieldError("code")}
          </div>
          <div className="curriculum-field">
            <label htmlFor="subject-title">Subject title <span aria-hidden="true">*</span></label>
            <Input
              id="subject-title"
              name="title"
              value={values.title}
              placeholder="e.g. Introduction to Computing"
              maxLength={subjectTitleMaxLength}
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy("title")}
              onChange={(event) => update({ title: event.target.value }, ["title"])}
            />
            {fieldError("title")}
          </div>
        </div>

        <div>
          <div className="subject-field-row">
            <div className="curriculum-field">
              <label htmlFor="subject-year-level">Year level <span aria-hidden="true">*</span></label>
              <Select
                value={String(values.yearLevel)}
                onValueChange={(value) =>
                  update({ yearLevel: Number(value) }, ["term", "prerequisiteIds", "corequisiteIds"])
                }
              >
                <SelectTrigger
                  id="subject-year-level"
                  className="subject-select"
                  aria-invalid={Boolean(errors.term)}
                  aria-describedby={describedBy("term")}
                >
                  <SelectValue>{yearLevelLabel(values.yearLevel)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: yearLevels }, (_, index) => index + 1).map((yearLevel) => (
                    <SelectItem key={yearLevel} value={String(yearLevel)}>{yearLevelLabel(yearLevel)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="curriculum-field">
              <label htmlFor="subject-semester">Semester <span aria-hidden="true">*</span></label>
              <Select
                value={values.semester}
                onValueChange={(value) => {
                  if (isSemester(value)) update({ semester: value }, ["term", "prerequisiteIds", "corequisiteIds"]);
                }}
              >
                <SelectTrigger
                  id="subject-semester"
                  className="subject-select"
                  aria-invalid={Boolean(errors.term)}
                  aria-describedby={describedBy("term")}
                >
                  <SelectValue>{semesterLabel(values.semester)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.value} value={semester.value}>{semester.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.term && <div className="subject-row-error">{fieldError("term")}</div>}
        </div>

        <div>
          <div className="subject-field-row subject-units-row">
            {unitField("lectureUnits", "Lecture units")}
            {unitField("laboratoryUnits", "Laboratory units")}
            <div className="curriculum-field">
              <label htmlFor="subject-units">Total units</label>
              <output id="subject-units" className="subject-units-total" htmlFor="subject-lectureUnits subject-laboratoryUnits">
                {totalUnits ? `${totalUnits} (${totalUnits} ${totalUnits === "1" ? "hr" : "hrs"}/week)` : "—"}
              </output>
            </div>
          </div>
          <p className="field-help subject-row-help" id="subject-units-help">
            Total units are lecture + laboratory units. Each unit is one weekly contact hour.
          </p>
        </div>

        <hr className="subject-divider" />

        <div>
          <div className="subject-field-row">
            <div className="curriculum-field">
              <label htmlFor="subject-prerequisites">Prerequisites</label>
              <RequisitePicker
                id="subject-prerequisites"
                label="Prerequisites"
                options={prerequisites}
                ineligible={ineligible(values.prerequisiteIds, prerequisites)}
                selectedIds={values.prerequisiteIds}
                onChange={(prerequisiteIds) => update({ prerequisiteIds }, ["prerequisiteIds"])}
                emptyMessage="No subjects in earlier terms. Prerequisites must come before this subject's term."
                invalid={Boolean(errors.prerequisiteIds)}
                describedBy={describedBy("prerequisiteIds", "subject-requisites-help")}
              />
              {fieldError("prerequisiteIds")}
            </div>
            <div className="curriculum-field">
              <label htmlFor="subject-corequisites">Corequisites</label>
              <RequisitePicker
                id="subject-corequisites"
                label="Corequisites"
                options={corequisites}
                ineligible={ineligible(values.corequisiteIds, corequisites)}
                selectedIds={values.corequisiteIds}
                onChange={(corequisiteIds) => update({ corequisiteIds }, ["corequisiteIds"])}
                emptyMessage="No other subjects in this term yet."
                invalid={Boolean(errors.corequisiteIds)}
                describedBy={describedBy("corequisiteIds", "subject-requisites-help")}
              />
              {fieldError("corequisiteIds")}
            </div>
          </div>
          <p className="field-help subject-row-help" id="subject-requisites-help">
            Select subjects from this curriculum. Corequisites are taken together.
          </p>
        </div>
      </div>
      <DialogFooter className="curriculum-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{editing ? "Save changes" : "Add subject"}</Button>
      </DialogFooter>
    </form>
  );
}
