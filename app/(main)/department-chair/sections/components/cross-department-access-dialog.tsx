"use client";

import { useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { accessTimestamp, offeringTermLabel } from "@/lib/sections";
import type { CrossDepartmentAccess, CrossDepartmentAccessDialogProps } from "@/types/sections-exports";

type AccessMode = CrossDepartmentAccess["mode"];

export function CrossDepartmentAccessDialog({ subject, offering, department, onClose, onSave }: CrossDepartmentAccessDialogProps) {
  const current = offering.crossDepartmentAccess;
  const [mode, setMode] = useState<AccessMode>(current.mode);
  const [opensAt, setOpensAt] = useState(current.mode === "scheduled" ? current.opensAt : "");
  const dateMissing = mode === "scheduled" && !Number.isFinite(accessTimestamp(opensAt));

  const options = [
    {
      value: "scheduled",
      label: "Open on a date",
      description: "Remaining seats open to other departments automatically at this date and time (Philippine time).",
    },
    {
      value: "open",
      label: "Open now",
      description: "Students from other departments can take remaining seats right away.",
    },
    {
      value: "reserved",
      label: `Keep reserved for ${department}`,
      description: "Only your department's students can enroll until you change this.",
    },
  ] as const satisfies readonly { value: AccessMode; label: string; description: string }[];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dateMissing) return;
    onSave(mode === "scheduled" ? { mode, opensAt } : { mode });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="section-entry-dialog access-dialog" showCloseButton={false}>
        <form onSubmit={submit}>
          <header className="section-entry-dialog-header">
            <div>
              <DialogTitle>Other departments</DialogTitle>
              <DialogDescription>{subject.code} · {offeringTermLabel(offering.term)}</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </header>

          <p className="access-dialog-intro">
            {department} students can always enroll once {subject.code} is published. Choose when seats they have not
            taken open to students from other departments.
          </p>

          <fieldset className="access-dialog-options">
            <legend className="sr-only">When other departments can enroll</legend>
            {options.map((option) => (
              <label key={option.value} data-checked={mode === option.value}>
                <input
                  type="radio"
                  name="cross-department-access"
                  value={option.value}
                  checked={mode === option.value}
                  onChange={() => setMode(option.value)}
                />
                <span className="access-dialog-copy">
                  <span>{option.label}</span>
                  <span>{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {mode === "scheduled" && (
            <div className="section-entry-field">
              <label htmlFor="cross-department-opens-at" className="access-dialog-date-label">Opens on</label>
              <Input
                id="cross-department-opens-at"
                type="datetime-local"
                value={opensAt}
                required
                aria-invalid={dateMissing}
                aria-describedby={dateMissing ? "cross-department-opens-at-error" : undefined}
                onChange={(event) => setOpensAt(event.target.value)}
              />
              {dateMissing && (
                <p id="cross-department-opens-at-error" className="access-dialog-error">Choose an opening date and time.</p>
              )}
            </div>
          )}

          <footer className="section-entry-dialog-actions">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
            <Button type="submit" disabled={dateMissing}>
              Save access
              <Check aria-hidden="true" />
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
