"use client";

import { useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { countLabel, describeSubjectUnits } from "@/lib/sections";
import type { AddOfferedSubjectsDialogProps } from "@/types/sections-exports";

export function AddOfferedSubjectsDialog({ termLabel, yearLabel, subjects, onClose, onAdd }: AddOfferedSubjectsDialogProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  function toggle(code: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const codes = subjects.map((subject) => subject.code).filter((code) => selected.has(code));
    if (codes.length > 0) onAdd(codes);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="section-entry-dialog offered-subjects-dialog" showCloseButton={false}>
        <form onSubmit={submit}>
          <header className="section-entry-dialog-header">
            <div>
              <DialogTitle>Add subjects</DialogTitle>
              <DialogDescription>{yearLabel} · {termLabel}</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </header>

          {subjects.length === 0 ? (
            <p className="offered-subjects-empty" role="status">
              Every approved {yearLabel.toLocaleLowerCase()} subject is already offered in {termLabel.toLocaleLowerCase()}.
            </p>
          ) : (
            <fieldset className="offered-subjects-options">
              <legend>Approved subjects</legend>
              {subjects.map((subject) => {
                const id = `offered-subject-${subject.code.replace(/\s+/g, "-")}`;
                return (
                  <label key={subject.code} htmlFor={id} data-checked={selected.has(subject.code)}>
                    <Checkbox
                      id={id}
                      checked={selected.has(subject.code)}
                      onCheckedChange={(checked) => toggle(subject.code, checked === true)}
                    />
                    <span className="offered-subjects-copy">
                      <span><strong>{subject.code}</strong> {subject.title}</span>
                      <span>
                        {describeSubjectUnits(subject)} · Curriculum: {subject.semester === 1 ? "1st" : "2nd"} semester
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          )}

          <footer className="section-entry-dialog-actions">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
            <Button type="submit" disabled={selected.size === 0}>
              {selected.size > 0 ? `Add ${countLabel(selected.size, "subject")}` : "Add subjects"}
              <Check aria-hidden="true" />
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
