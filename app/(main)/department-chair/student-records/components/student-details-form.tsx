"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  canEditStudentId,
  emptyStudentForm,
  studentFormValues,
  studentNameMaxLength,
  studentYearStandings,
  validateStudentDetails,
} from "@/lib/student-records";
import type {
  StudentDetailsFormProps,
  StudentFormErrors,
  StudentFormValues,
} from "@/types/student-records-exports";

const fieldOrder = ["name", "email", "studentNumber", "yearStanding", "batch"] as const;

/** The fields shared by the Add student and Edit student dialogs. */
export function StudentDetailsForm({ students, student, idPrefix, submitLabel, onSubmit }: StudentDetailsFormProps) {
  const [values, setValues] = useState<StudentFormValues>(() => (student ? studentFormValues(student) : emptyStudentForm));
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const idLocked = student !== undefined && !canEditStudentId(student);
  const fieldId = (field: keyof StudentFormValues) => `${idPrefix}-${field}`;
  const idHelpId = `${idPrefix}-studentNumber-help`;

  function update(field: keyof StudentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateStudentDetails(values, students, student);
    setErrors(result.errors);
    if (!result.student) {
      const firstInvalid = fieldOrder.find((field) => result.errors[field]);
      if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    onSubmit(result.student);
  }

  function fieldProps(field: keyof StudentFormValues, help?: string) {
    return {
      id: fieldId(field),
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": [help, errors[field] ? `${fieldId(field)}-error` : ""].filter(Boolean).join(" ") || undefined,
    };
  }

  function fieldError(field: keyof StudentFormValues) {
    return errors[field] ? (
      <p className="field-error" id={`${fieldId(field)}-error`} role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="student-records-dialog-body">
        <div className="student-records-field">
          <label htmlFor={fieldId("name")}>Full name <span aria-hidden="true">*</span></label>
          <Input
            {...fieldProps("name")}
            name="name"
            value={values.name}
            placeholder="e.g. Juan Miguel Dela Cruz"
            maxLength={studentNameMaxLength}
            autoComplete="off"
            required
            onChange={(event) => update("name", event.target.value)}
          />
          {fieldError("name")}
        </div>

        <div className="student-records-field">
          <label htmlFor={fieldId("email")}>University email <span aria-hidden="true">*</span></label>
          <Input
            {...fieldProps("email")}
            name="email"
            type="email"
            value={values.email}
            placeholder="e.g. juan.delacruz@university.edu"
            autoComplete="off"
            required
            onChange={(event) => update("email", event.target.value)}
          />
          {fieldError("email")}
        </div>

        <div className="student-records-field">
          <label htmlFor={fieldId("studentNumber")}>Student ID <span aria-hidden="true">*</span></label>
          <Input
            {...fieldProps("studentNumber", idLocked ? idHelpId : undefined)}
            name="studentNumber"
            value={values.studentNumber}
            placeholder="e.g. 22-1234-567"
            inputMode="numeric"
            maxLength={11}
            autoComplete="off"
            readOnly={idLocked}
            required
            onChange={(event) => update("studentNumber", event.target.value)}
          />
          {idLocked && (
            <p className="field-help" id={idHelpId}>
              It can&apos;t change after the student sets up their account.
            </p>
          )}
          {fieldError("studentNumber")}
        </div>

        <div className="student-records-field-row">
          <div className="student-records-field">
            <label htmlFor={fieldId("yearStanding")}>Year standing <span aria-hidden="true">*</span></label>
            <Select value={values.yearStanding} onValueChange={(value) => update("yearStanding", value)}>
              <SelectTrigger {...fieldProps("yearStanding")}>
                <SelectValue placeholder="Choose year" />
              </SelectTrigger>
              <SelectContent position="popper">
                {studentYearStandings.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldError("yearStanding")}
          </div>
          <div className="student-records-field">
            <label htmlFor={fieldId("batch")}>Batch <span aria-hidden="true">*</span></label>
            <Input
              {...fieldProps("batch")}
              name="batch"
              value={values.batch}
              placeholder="e.g. 2026–2030"
              maxLength={11}
              autoComplete="off"
              required
              onChange={(event) => update("batch", event.target.value)}
            />
            {fieldError("batch")}
          </div>
        </div>
      </div>
      <DialogFooter className="student-records-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}

