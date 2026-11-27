"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StudentRecordStudent } from "@/types/student-records-exports";

import { StudentDetailsForm } from "./student-details-form";
import { useStudentRecords } from "./student-records-provider";

/** The row's edit button, which other code can focus after the row is re-keyed. */
export function editStudentButtonId(studentNumber: string) {
  return `edit-student-${studentNumber}`;
}

export function EditStudentDialog({ student }: { student: StudentRecordStudent }) {
  const { students, updateStudent } = useStudentRecords();
  const [open, setOpen] = useState(false);

  function save(details: StudentRecordStudent) {
    setOpen(false);
    const changed = (["name", "email", "studentNumber", "yearStanding", "batch"] as const)
      .some((field) => details[field] !== student[field]);
    if (!changed) return;

    updateStudent(student.studentNumber, details);
    const reinvited = student.invitation && details.email !== student.email;
    toast.success(reinvited
      ? `${details.name}'s details were updated. A new invitation was sent to ${details.email}.`
      : `${details.name}'s details were updated.`);

    // A new student ID re-keys the row, so return focus to its new edit button.
    if (details.studentNumber !== student.studentNumber) {
      window.setTimeout(() => document.getElementById(editStudentButtonId(details.studentNumber))?.focus());
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id={editStudentButtonId(student.studentNumber)}
          type="button"
          variant="outline"
          className="student-records-edit-button"
          aria-label={`Edit details for ${student.name}`}
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="student-records-dialog">
        <DialogHeader className="student-records-dialog-header">
          <DialogTitle>Edit student</DialogTitle>
          <DialogDescription>
            {student.invitation
              ? "Update this student's details. Changing their email sends a new invitation to the new address."
              : "Update this student's details."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from the saved details. */}
        <StudentDetailsForm
          students={students}
          student={student}
          idPrefix="edit-student"
          submitLabel="Save changes"
          onSubmit={save}
        />
      </DialogContent>
    </Dialog>
  );
}
