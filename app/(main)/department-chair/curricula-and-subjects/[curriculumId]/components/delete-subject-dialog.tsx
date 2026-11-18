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
import { termLabel } from "@/lib/curriculum-subjects";
import type { Curriculum, DegreeProgram, Subject, SubjectDependent } from "@/types/curriculum-types";

interface DeleteSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  program: DegreeProgram;
  curriculum: Curriculum;
  subject: Subject;
  /** Subjects that list this one as a requisite; deletion is blocked while any exist. */
  dependents: readonly SubjectDependent[];
  onConfirm: () => void;
}

export function DeleteSubjectDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  program,
  curriculum,
  subject,
  dependents,
  onConfirm,
}: DeleteSubjectDialogProps) {
  const blocked = dependents.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="curriculum-dialog curriculum-confirm-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="curriculum-dialog-header">
          <DialogTitle>Delete this subject?</DialogTitle>
          <DialogDescription>
            Remove this subject from the {curriculum.name}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the confirmation text resets each time. */}
        <DeleteSubjectForm
          program={program}
          curriculum={curriculum}
          subject={subject}
          dependents={dependents}
          blocked={blocked}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteSubjectForm({
  program,
  curriculum,
  subject,
  dependents,
  blocked,
  onConfirm,
}: Pick<DeleteSubjectDialogProps, "program" | "curriculum" | "subject" | "dependents" | "onConfirm"> & {
  blocked: boolean;
}) {
  const [confirmation, setConfirmation] = useState("");
  const matches = !blocked && confirmation.trim() === subject.code;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches) onConfirm();
  }

  return (
    <form onSubmit={submit}>
      <div className="curriculum-dialog-body">
        <div className="subject-summary-card">
          <p className="subject-summary-title">{subject.code} · {subject.title}</p>
          <p>{curriculum.name} · {program.shortName}</p>
          <p>{termLabel(subject)} · {subject.units} {subject.units === 1 ? "unit" : "units"}</p>
        </div>

        {blocked ? (
          <div className="curriculum-impact" data-tone="destroy" role="alert">
            <p className="curriculum-impact-title">This subject is required by other subjects</p>
            <ul className="subject-dependent-list">
              {dependents.map(({ subject: dependent, relation }) => (
                <li key={dependent.id}>
                  {dependent.code} lists it as a {relation} ({termLabel(dependent)}).
                </li>
              ))}
            </ul>
            <p>Remove it from {dependents.length === 1 ? "that subject's" : "those subjects'"} requisites before deleting.</p>
          </div>
        ) : (
          <>
            <div className="curriculum-impact" data-tone="caution">
              <p className="curriculum-impact-title">Only this subject will be removed</p>
              <p>
                Other subjects and the curriculum will remain. Subjects linked to enrollment, grades, or other subject
                requirements cannot be deleted.
              </p>
            </div>
            <div className="curriculum-field">
              <label htmlFor="subject-delete-confirmation">Type “{subject.code}” to confirm</label>
              <Input
                id="subject-delete-confirmation"
                value={confirmation}
                placeholder="Enter subject code"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="subject-delete-help"
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <p className="field-help" id="subject-delete-help">
                The delete button is enabled only when the code matches.
              </p>
            </div>
          </>
        )}
      </div>
      <DialogFooter className="curriculum-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">{blocked ? "Close" : "Cancel"}</Button>
        </DialogClose>
        <Button type="submit" variant="destructive" className="curriculum-delete-confirm" disabled={!matches}>
          Delete subject
        </Button>
      </DialogFooter>
    </form>
  );
}
