"use client";

import { useState, type FormEvent } from "react";
import { Check, CircleAlert, CircleCheck, FlaskConical, Info, Presentation, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  classTypeLabels,
  draftFromEntry,
  entryFromDraft,
  formatHours,
  formatSectionSchedule,
  hourLimitFor,
  meetingDayNames,
  meetingDays,
  validateSectionEntry,
} from "@/lib/sections";
import type {
  FacultyMember,
  SectionClassType,
  SectionEntryDialogProps,
  SectionEntryDraft,
  SectionEntryValidation,
} from "@/types/sections-exports";

const classTypeIcons = { lecture: Presentation, laboratory: FlaskConical } as const;
// Radix Select reserves the empty string, so "unassigned" stands in for no faculty member.
const unassignedValue = "unassigned";

function ValidationSummary({ validation, draft, subjectCode, faculty }: {
  validation: SectionEntryValidation;
  draft: SectionEntryDraft;
  subjectCode: string;
  faculty: readonly FacultyMember[];
}) {
  const typeLabel = classTypeLabels[draft.classType].label.toLocaleLowerCase();
  const overLimit = validation.totalHours !== null && validation.totalHours > validation.hourLimit;
  const problems = [
    ...validation.conflicts.map(({ kind, entry }) => {
      const meeting = `${entry.subjectCode} ${classTypeLabels[entry.classType].short} (${formatSectionSchedule(entry)})`;
      if (kind === "section") return `${entry.section} already meets for ${meeting}.`;
      if (kind === "room") return `${entry.room} is already used by ${entry.section} for ${meeting}.`;
      const name = faculty.find((member) => member.id === entry.facultyId)?.name ?? "This faculty member";
      return `${name} already teaches ${entry.section} ${meeting}.`;
    }),
    ...(overLimit
      ? [`${draft.section.trim()} ${typeLabel} would total ${formatHours(validation.totalHours ?? 0)} hrs/week; ${subjectCode} allows ${formatHours(validation.hourLimit)}.`]
      : []),
  ];

  if (validation.missing.length > 0) {
    return (
      <div className="section-entry-validation" data-state="incomplete" role="status">
        <p><Info aria-hidden="true" />Complete the entry to check for conflicts</p>
        <span>{validation.missing[0]}</span>
      </div>
    );
  }

  if (problems.length > 0) {
    return (
      <div className="section-entry-validation" data-state="conflict" role="status">
        <p><CircleAlert aria-hidden="true" />{validation.conflicts.length > 0 ? "Schedule conflict detected" : "Weekly hours exceeded"}</p>
        <ul>{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
      </div>
    );
  }

  return (
    <div className="section-entry-validation" data-state="valid" role="status">
      <p><CircleCheck aria-hidden="true" />No schedule conflicts</p>
    </div>
  );
}

export function SectionEntryDialog({ subject, offering, entry, entries, faculty, onClose, onSave }: SectionEntryDialogProps) {
  const [draft, setDraft] = useState(() => draftFromEntry(entry));
  const validation = validateSectionEntry(draft, subject, entries, entry?.id);
  const editing = entry !== undefined;

  function update(patch: Partial<SectionEntryDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validation.canSave) return;
    onSave(entryFromDraft(draft, offering, entry?.id ?? globalThis.crypto.randomUUID()));
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="section-entry-dialog" showCloseButton={false}>
        <form onSubmit={submit} noValidate>
          <header className="section-entry-dialog-header">
            <div>
              <DialogTitle>{editing ? "Edit section entry" : "Add section"}</DialogTitle>
              <DialogDescription>{subject.code} · {subject.title}</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </header>

          <div className="section-entry-fields">
            <div className="section-entry-field">
              <Label htmlFor="section-entry-section">Section</Label>
              <Input
                id="section-entry-section"
                value={draft.section}
                placeholder="BSCS 3-A"
                autoComplete="off"
                required
                onChange={(event) => update({ section: event.target.value })}
              />
            </div>
            <div className="section-entry-field">
              <Label htmlFor="section-entry-capacity">Capacity</Label>
              <Input
                id="section-entry-capacity"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={draft.capacity}
                placeholder="40"
                required
                onChange={(event) => update({ capacity: event.target.value })}
              />
            </div>
          </div>

          <div className="section-entry-field">
            <Label id="section-entry-faculty-label">Faculty member</Label>
            <Select
              value={draft.facultyId || unassignedValue}
              onValueChange={(value) => update({ facultyId: value === unassignedValue ? "" : value })}
            >
              <SelectTrigger className="section-entry-faculty-trigger" aria-labelledby="section-entry-faculty-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="section-entry-faculty-menu">
                <SelectItem value={unassignedValue} className="section-entry-faculty-option">Unassigned</SelectItem>
                {faculty.map((member) => (
                  <SelectItem key={member.id} value={member.id} className="section-entry-faculty-option">
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset className="section-entry-class-type">
            <legend>Class type</legend>
            <div className="section-entry-segments">
              {(["lecture", "laboratory"] as const satisfies readonly SectionClassType[]).map((classType) => {
                const Icon = classTypeIcons[classType];
                const unavailable = hourLimitFor(subject, classType) === 0;
                return (
                  <label
                    key={classType}
                    data-checked={draft.classType === classType}
                    data-disabled={unavailable}
                    title={unavailable ? `${subject.code} has no ${classTypeLabels[classType].label.toLocaleLowerCase()} hours.` : undefined}
                  >
                    <input
                      type="radio"
                      name="section-entry-class-type"
                      value={classType}
                      checked={draft.classType === classType}
                      disabled={unavailable}
                      onChange={() => update({ classType })}
                    />
                    <Icon aria-hidden="true" />
                    {classTypeLabels[classType].label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="section-entry-schedule" role="group" aria-labelledby="section-entry-schedule-title">
            <div className="section-entry-schedule-header">
              <p id="section-entry-schedule-title">Schedule</p>
              <span aria-live="polite">
                {validation.entryHours === null ? "— hrs/week" : `${formatHours(validation.entryHours)} hrs/week`}
              </span>
            </div>
            <div className="section-entry-days" role="group" aria-label="Meeting days">
              {meetingDays.map((day) => {
                const selected = draft.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    aria-label={meetingDayNames[day]}
                    onClick={() => update({ days: selected ? draft.days.filter((item) => item !== day) : [...draft.days, day] })}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="section-entry-fields section-entry-time-fields">
              <div className="section-entry-field">
                <Label htmlFor="section-entry-start">Start</Label>
                <Input
                  id="section-entry-start"
                  type="time"
                  step={300}
                  value={draft.startTime}
                  required
                  onChange={(event) => update({ startTime: event.target.value })}
                />
              </div>
              <div className="section-entry-field">
                <Label htmlFor="section-entry-end">End</Label>
                <Input
                  id="section-entry-end"
                  type="time"
                  step={300}
                  value={draft.endTime}
                  required
                  onChange={(event) => update({ endTime: event.target.value })}
                />
              </div>
              <div className="section-entry-field">
                <Label htmlFor="section-entry-room">Room</Label>
                <Input
                  id="section-entry-room"
                  value={draft.room}
                  placeholder="ENG 204 or TBA"
                  autoComplete="off"
                  required
                  onChange={(event) => update({ room: event.target.value })}
                />
              </div>
            </div>
          </div>

          <ValidationSummary validation={validation} draft={draft} subjectCode={subject.code} faculty={faculty} />

          <footer className="section-entry-dialog-actions">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!validation.canSave}>
              {editing ? "Save changes" : "Save"}
              <Check aria-hidden="true" />
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
