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
import { subjectCountLabel } from "@/lib/curricula";
import type { Curriculum, DegreeProgram } from "@/types/curriculum-types";
import { CurriculumSummaryCard } from "./curriculum-summary-card";

interface CurriculumRemovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  program: DegreeProgram;
  curriculum: Curriculum;
  subjectCount: number;
  onConfirm: () => void;
}

function CurriculumIdentity({ program, curriculum }: Pick<CurriculumRemovalDialogProps, "program" | "curriculum">) {
  return (
    <CurriculumSummaryCard
      title={curriculum.name}
      details={[program.name, `Implemented ${curriculum.implementedYear}`]}
    />
  );
}

export function ArchiveCurriculumDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  program,
  curriculum,
  subjectCount: count,
  onConfirm,
}: CurriculumRemovalDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="curriculum-dialog curriculum-confirm-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="curriculum-dialog-header">
          <DialogTitle>Archive this curriculum?</DialogTitle>
          <DialogDescription>
            Move this curriculum to Archived. Its records stay available and can be restored later.
          </DialogDescription>
        </DialogHeader>
        <div className="curriculum-dialog-body">
          <CurriculumIdentity program={program} curriculum={curriculum} />
          <div className="curriculum-impact" data-tone="preserve">
            <p className="curriculum-impact-title">
              {count === 0
                ? "No subjects yet"
                : count === 1 ? "The 1 subject will be preserved" : `All ${count} subjects will be preserved`}
            </p>
            <p>
              {count === 0 ? "The curriculum becomes" : "The curriculum and its subjects become"} read-only until
              restored. Nothing is permanently deleted.
            </p>
          </div>
        </div>
        <DialogFooter className="curriculum-dialog-footer">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={onConfirm}>Archive curriculum</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCurriculumDialog(props: CurriculumRemovalDialogProps) {
  const { open, onOpenChange, onCloseAutoFocus, subjectCount: count } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="curriculum-dialog curriculum-confirm-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="curriculum-dialog-header">
          <DialogTitle>Delete this curriculum?</DialogTitle>
          <DialogDescription>
            Permanently remove this curriculum{count > 0 ? " and every subject created under it" : ""}. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the confirmation text resets each time. */}
        <DeleteConfirmationForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmationForm({ program, curriculum, subjectCount: count, onConfirm }: CurriculumRemovalDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const matches = confirmation.trim() === curriculum.name;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches) onConfirm();
  }

  return (
    <form onSubmit={submit}>
      <div className="curriculum-dialog-body">
        <CurriculumIdentity program={program} curriculum={curriculum} />
        <div className="curriculum-impact" data-tone="destroy">
          <p className="curriculum-impact-title">
            {count === 0 ? "No subjects yet" : `${subjectCountLabel(count)} will also be deleted`}
          </p>
          <p>
            {count === 0
              ? "This curriculum has no subjects to delete."
              : "Includes subjects across all year levels and semesters."}
          </p>
        </div>
        <div className="curriculum-field">
          <label htmlFor="curriculum-delete-confirmation">Type “{curriculum.name}” to confirm</label>
          <Input
            id="curriculum-delete-confirmation"
            value={confirmation}
            placeholder="Enter curriculum name"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="curriculum-delete-help"
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <p className="field-help" id="curriculum-delete-help">
            The delete button is enabled only when the name matches exactly.
          </p>
        </div>
      </div>
      <DialogFooter className="curriculum-dialog-footer">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" variant="destructive" className="curriculum-delete-confirm" disabled={!matches}>
          {count > 0 ? "Delete curriculum & subjects" : "Delete curriculum"}
        </Button>
      </DialogFooter>
    </form>
  );
}
