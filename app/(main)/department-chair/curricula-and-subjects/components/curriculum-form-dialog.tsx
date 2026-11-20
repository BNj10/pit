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
import { Textarea } from "@/components/ui/textarea";
import {
  curriculumDescriptionMaxLength,
  curriculumFormValues,
  curriculumNameMaxLength,
  validateCurriculumDetails,
} from "@/lib/curricula";
import type {
  Curriculum,
  CurriculumDetails,
  CurriculumFormErrors,
  CurriculumFormValues,
  DegreeProgram,
} from "@/types/curriculum-types";
import { CurriculumSummaryCard } from "./curriculum-summary-card";

interface CurriculumFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  program: DegreeProgram;
  curricula: readonly Curriculum[];
  /** The draft being edited; omit to add a curriculum. */
  curriculum?: Curriculum;
  onSubmit: (details: CurriculumDetails) => void;
}

export function CurriculumFormDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  curriculum,
  ...formProps
}: CurriculumFormDialogProps) {
  const editing = curriculum !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="curriculum-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="curriculum-dialog-header">
          <DialogTitle>{editing ? "Edit curriculum" : "Add curriculum"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details of your selected curriculum."
              : "Create a curriculum for your assigned degree program."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from fresh values. */}
        <CurriculumForm key={curriculum?.id ?? "new"} curriculum={curriculum} {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

const fieldOrder = ["name", "year", "implementedYear", "description"] as const;

function CurriculumForm({
  program,
  curricula,
  curriculum,
  onSubmit,
}: Pick<CurriculumFormDialogProps, "program" | "curricula" | "curriculum" | "onSubmit">) {
  const editing = curriculum !== undefined;
  const [values, setValues] = useState<CurriculumFormValues>(() => curriculumFormValues(curriculum));
  const [errors, setErrors] = useState<CurriculumFormErrors>({});

  function update(field: keyof CurriculumFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateCurriculumDetails(values, curricula, curriculum?.id);
    setErrors(result.errors);
    if (!result.details) {
      const firstInvalid = fieldOrder.find((field) => result.errors[field]);
      const input = firstInvalid && form.elements.namedItem(firstInvalid);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    onSubmit(result.details);
  }

  function describedBy(field: keyof CurriculumFormValues, help?: string) {
    return [help, errors[field] ? `curriculum-${field}-error` : ""].filter(Boolean).join(" ") || undefined;
  }

  function fieldError(field: keyof CurriculumFormValues) {
    return errors[field] ? (
      <p className="field-error" id={`curriculum-${field}-error`} role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="curriculum-dialog-body">
        <CurriculumSummaryCard label="Assigned degree program" title={program.name} />

        <div className="curriculum-field">
          <label htmlFor="curriculum-name">Curriculum name <span aria-hidden="true">*</span></label>
          <Input
            id="curriculum-name"
            name="name"
            value={values.name}
            placeholder={`e.g. ${program.name.replace("Bachelor of Science in", "BS")} Curriculum 2026`}
            maxLength={curriculumNameMaxLength}
            autoComplete="off"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            onChange={(event) => update("name", event.target.value)}
          />
          {fieldError("name")}
        </div>

        <div className="curriculum-field-row">
          <div className="curriculum-field">
            <label htmlFor="curriculum-year">Curriculum year <span aria-hidden="true">*</span></label>
            <Input
              id="curriculum-year"
              name="year"
              value={values.year}
              placeholder="e.g. 2026"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.year)}
              aria-describedby={describedBy("year")}
              onChange={(event) => update("year", event.target.value)}
            />
            {fieldError("year")}
          </div>
          {/* Entered as-is: nothing is copied from the curriculum year, and there is no end year. */}
          <div className="curriculum-field">
            <label htmlFor="curriculum-implementedYear">Year implemented <span aria-hidden="true">*</span></label>
            <Input
              id="curriculum-implementedYear"
              name="implementedYear"
              value={values.implementedYear}
              placeholder="e.g. 2031"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.implementedYear)}
              aria-describedby={describedBy("implementedYear")}
              onChange={(event) => update("implementedYear", event.target.value)}
            />
            {fieldError("implementedYear")}
          </div>
        </div>

        <div className="curriculum-field">
          <label htmlFor="curriculum-status">{editing ? "Current status" : "Initial status"}</label>
          <Input
            id="curriculum-status"
            value={curriculum?.status ?? "Draft"}
            readOnly
            aria-describedby={editing ? undefined : "curriculum-status-help"}
          />
          {!editing && (
            <p className="field-help" id="curriculum-status-help">
              New curricula start as drafts.
            </p>
          )}
        </div>

        <div className="curriculum-field">
          <label htmlFor="curriculum-description">Description (optional)</label>
          <Textarea
            id="curriculum-description"
            name="description"
            value={values.description}
            placeholder={editing ? "Add a description (optional)" : "e.g. Updated curriculum for incoming students"}
            maxLength={curriculumDescriptionMaxLength}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={describedBy("description")}
            onChange={(event) => update("description", event.target.value)}
          />
          {fieldError("description")}
        </div>

        <p className="curriculum-dialog-note">
          {editing
            ? "Manage subjects and status separately."
            : "It opens after creation so you can add subjects."}
        </p>
      </div>
      <DialogFooter className="curriculum-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{editing ? "Save changes" : "Create curriculum"}</Button>
      </DialogFooter>
    </form>
  );
}
