"use client";

import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emptyNewStudent, studentNameMaxLength, validateNewStudent } from "@/lib/student-records";
import type {
  AddStudentDialogProps,
  NewStudentFormErrors,
  NewStudentFormValues,
} from "@/types/student-records-exports";

const fieldOrder = ["name", "email", "studentNumber", "yearStanding", "batch"] as const;

export function AddStudentDialog(props: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="student-records-add-button">
          <UserPlus aria-hidden="true" />
          Add student
        </Button>
      </DialogTrigger>
      <DialogContent className="student-records-dialog">
        <DialogHeader className="student-records-dialog-header">
          <DialogTitle>Add student</DialogTitle>
          <DialogDescription>Add a student to your department&apos;s student records.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from empty fields. */}
        <AddStudentForm
          {...props}
          onAdd={(student) => {
            props.onAdd(student);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddStudentForm({ students, yearStandings, batches, onAdd }: AddStudentDialogProps) {
  const [values, setValues] = useState<NewStudentFormValues>(emptyNewStudent);
  const [errors, setErrors] = useState<NewStudentFormErrors>({});

  function update(field: keyof NewStudentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateNewStudent(values, students, { yearStandings, batches });
    setErrors(result.errors);
    if (!result.student) {
      const firstInvalid = fieldOrder.find((field) => result.errors[field]);
      if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    onAdd(result.student);
  }

  function fieldProps(field: keyof NewStudentFormValues) {
    return {
      id: fieldId(field),
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined,
    };
  }

  function fieldError(field: keyof NewStudentFormValues) {
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
            {...fieldProps("studentNumber")}
            name="studentNumber"
            value={values.studentNumber}
            placeholder="e.g. 22-1234-567"
            inputMode="numeric"
            maxLength={11}
            autoComplete="off"
            required
            onChange={(event) => update("studentNumber", event.target.value)}
          />
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
                {yearStandings.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldError("yearStanding")}
          </div>
          <div className="student-records-field">
            <label htmlFor={fieldId("batch")}>Batch <span aria-hidden="true">*</span></label>
            <Select value={values.batch} onValueChange={(value) => update("batch", value)}>
              <SelectTrigger {...fieldProps("batch")}>
                <SelectValue placeholder="Choose batch" />
              </SelectTrigger>
              <SelectContent position="popper">
                {batches.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldError("batch")}
          </div>
        </div>
      </div>
      <DialogFooter className="student-records-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Add student</Button>
      </DialogFooter>
    </form>
  );
}

function fieldId(field: keyof NewStudentFormValues) {
  return `add-student-${field}`;
}
