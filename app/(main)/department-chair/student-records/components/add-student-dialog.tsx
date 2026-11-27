"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AddStudentDialogProps } from "@/types/student-records-exports";

import { StudentDetailsForm } from "./student-details-form";

export function AddStudentDialog({ students, onAdd }: AddStudentDialogProps) {
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
          <DialogDescription>
            Add a student to your department. They&apos;ll get an email invitation to set up their account.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from empty fields. */}
        <StudentDetailsForm
          students={students}
          idPrefix="add-student"
          submitLabel="Add and send invite"
          onSubmit={(student) => {
            setOpen(false);
            onAdd(student);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
