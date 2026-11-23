"use client";

import { useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { termLabel } from "@/lib/curriculum-subjects";
import { countLabel, describeSubjectUnits, offerableSubjectGroups } from "@/lib/sections";
import type { AddOfferedSubjectsDialogProps } from "@/types/sections-exports";

export function AddOfferedSubjectsDialog({
  term,
  yearLevel,
  termLabel: offeringTermName,
  yearLabel,
  curricula,
  subjects,
  offeredSubjectIds,
  onClose,
  onAdd,
}: AddOfferedSubjectsDialogProps) {
  // Curricula arrive latest implemented first, so the latest active one is the default.
  const [curriculumId, setCurriculumId] = useState(() => curricula[0]?.id ?? "");
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const curriculum = curricula.find((item) => item.id === curriculumId);
  const groups = curriculum ? offerableSubjectGroups(subjects, curriculum.id, term, yearLevel, offeredSubjectIds) : [];

  function chooseCurriculum(id: string) {
    if (!curricula.some((item) => item.id === id)) return;
    setCurriculumId(id);
    // Selections belong to one curriculum's subjects.
    setSelected(new Set());
  }

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ids = groups.flatMap((group) => group.subjects.map((subject) => subject.id)).filter((id) => selected.has(id));
    if (ids.length > 0) onAdd(ids);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="section-entry-dialog offered-subjects-dialog" showCloseButton={false}>
        <form onSubmit={submit}>
          <header className="section-entry-dialog-header">
            <div>
              <DialogTitle>Add subjects</DialogTitle>
              <DialogDescription>{yearLabel} · {offeringTermName}</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </header>

          {!curriculum ? (
            <p className="offered-subjects-empty" role="status">
              No curriculum is active for this program. Activate one in Curricula and Subjects before adding subjects.
            </p>
          ) : (
            <>
              <div className="offered-subjects-curriculum">
                <label id="offered-subjects-curriculum-label" htmlFor="offered-subjects-curriculum">Curriculum</label>
                <Select value={curriculum.id} onValueChange={chooseCurriculum}>
                  <SelectTrigger
                    id="offered-subjects-curriculum"
                    className="offered-subjects-curriculum-trigger"
                    aria-labelledby="offered-subjects-curriculum-label"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="section-entry-faculty-menu">
                    {curricula.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="section-entry-faculty-option">
                        {item.name} · Implemented {item.implementedYear}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {curricula.length > 1 && (
                  <p>Showing the latest active curriculum first. Subjects from other active curricula can be offered in the same term.</p>
                )}
              </div>

              {groups.length === 0 ? (
                <p className="offered-subjects-empty" role="status">
                  Every {curriculum.name} subject for {yearLabel.toLocaleLowerCase()} is already offered in{" "}
                  {offeringTermName.toLocaleLowerCase()}.
                </p>
              ) : (
                <div className="offered-subjects-groups">
                  {groups.map((group) => (
                    <fieldset key={group.id} className="offered-subjects-options">
                      <legend>{group.label}</legend>
                      {group.subjects.map((subject) => {
                        const id = `offered-subject-${subject.id}`;
                        return (
                          <label key={subject.id} htmlFor={id} data-checked={selected.has(subject.id)}>
                            <Checkbox
                              id={id}
                              checked={selected.has(subject.id)}
                              onCheckedChange={(checked) => toggle(subject.id, checked === true)}
                            />
                            <span className="offered-subjects-copy">
                              <span><strong>{subject.code}</strong> {subject.title}</span>
                              <span>{describeSubjectUnits(subject)} · Curriculum: {termLabel(subject)}</span>
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                  ))}
                </div>
              )}
            </>
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
