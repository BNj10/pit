"use client";

import { useRef, useState } from "react";
import { BookPlus, CalendarPlus, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  classTypeLabels,
  compareSectionEntries,
  countLabel,
  offeringTermLabel,
  offeringTerms,
  subjectSectionsId,
} from "@/lib/sections";
import type {
  CurriculumSubject,
  CurriculumYearLevel,
  OfferingTerm,
  OfferingTermGroup,
  SectionEntry,
  SectionsManagerProps,
  SubjectOffering,
} from "@/types/sections-exports";
import { AddOfferedSubjectsDialog } from "./add-offered-subjects-dialog";
import { ConfirmRemovalDialog } from "./confirm-removal-dialog";
import { SectionEntryDialog } from "./section-entry-dialog";
import { SubjectSections } from "./subject-sections";

const yearLevels = [
  { value: 1, label: "First Year" },
  { value: 2, label: "Second Year" },
  { value: 3, label: "Third Year" },
  { value: 4, label: "Fourth Year" },
] as const satisfies readonly { value: CurriculumYearLevel; label: string }[];

type DialogState =
  | { kind: "add-entry"; subject: CurriculumSubject; offering: SubjectOffering }
  | { kind: "edit-entry" | "delete-entry"; subject: CurriculumSubject; offering: SubjectOffering; entry: SectionEntry }
  | { kind: "add-subjects"; term: OfferingTerm }
  | { kind: "remove-subject"; subject: CurriculumSubject; offering: SubjectOffering }
  | { kind: "remove-term"; term: OfferingTerm }
  | null;

const termKey = (group: OfferingTermGroup) => `${group.yearLevel}:${group.term}`;
const termDomId = (group: OfferingTermGroup) => `sections-term-${group.yearLevel}-${group.term}`;
const termOrder = (term: OfferingTerm) => offeringTerms.findIndex((item) => item.value === term);

function toggle<T>(set: ReadonlySet<T>, value: T) {
  const next = new Set(set);
  if (!next.delete(value)) next.add(value);
  return next;
}

function focusLater(id: string) {
  globalThis.requestAnimationFrame(() => document.getElementById(id)?.focus());
}

// Preview editor: changes stay in this browser session until offerings are saved through the server.
export function SectionsManager({ data }: SectionsManagerProps) {
  const [termGroups, setTermGroups] = useState<readonly OfferingTermGroup[]>(data.termGroups);
  const [offerings, setOfferings] = useState<readonly SubjectOffering[]>(data.offerings);
  const [entries, setEntries] = useState<readonly SectionEntry[]>(data.entries);
  const [yearLevel, setYearLevel] = useState<CurriculumYearLevel>(data.initialYearLevel);
  const [openTerms, setOpenTerms] = useState<ReadonlySet<string>>(() => {
    const first = data.termGroups.find((group) => group.yearLevel === data.initialYearLevel);
    return new Set(first ? [termKey(first)] : []);
  });
  const [openOfferings, setOpenOfferings] = useState<ReadonlySet<string>>(() => {
    const first = data.offerings.find((offering) => offering.yearLevel === data.initialYearLevel);
    return new Set(first ? [first.id] : []);
  });
  const [dialog, setDialog] = useState<DialogState>(null);
  // Set when a term is added, so the menu does not return focus to a trigger that may disappear.
  const addedTermFocusRef = useRef<string | null>(null);

  const subjectsByCode = new Map(data.subjects.map((subject) => [subject.code, subject]));
  const yearLabel = yearLevels.find((level) => level.value === yearLevel)?.label ?? "Year";
  const yearTerms = termGroups
    .filter((group) => group.yearLevel === yearLevel)
    .sort((a, b) => termOrder(a.term) - termOrder(b.term));
  const missingTerms = offeringTerms.filter((term) => !yearTerms.some((group) => group.term === term.value));
  const yearSubjects = data.subjects.filter((subject) => subject.yearLevel === yearLevel);

  const termOfferings = (term: OfferingTerm) =>
    offerings.filter((offering) => offering.yearLevel === yearLevel && offering.term === term);
  const offeringEntries = (offeringId: string) =>
    entries.filter((entry) => entry.offeringId === offeringId).sort(compareSectionEntries);
  // Rooms and section blocks are shared by every year level in the same term.
  const sameTermEntries = (term: OfferingTerm) => {
    const ids = new Set(offerings.filter((offering) => offering.term === term).map((offering) => offering.id));
    return entries.filter((entry) => ids.has(entry.offeringId));
  };

  function addTerm(term: OfferingTerm) {
    const group = { yearLevel, term };
    setTermGroups((current) => [...current, group]);
    setOpenTerms((current) => new Set(current).add(termKey(group)));
    toast.success(`${offeringTermLabel(term)} added to ${yearLabel}.`);
    // Adding the last missing term unmounts the menu, so no close event will move focus.
    if (missingTerms.length === 1) focusLater(`${termDomId(group)}-toggle`);
    else addedTermFocusRef.current = `${termDomId(group)}-toggle`;
  }

  function removeTerm(term: OfferingTerm) {
    const removedIds = new Set(termOfferings(term).map((offering) => offering.id));
    setTermGroups((current) => current.filter((group) => !(group.yearLevel === yearLevel && group.term === term)));
    setOfferings((current) => current.filter((offering) => !removedIds.has(offering.id)));
    setEntries((current) => current.filter((entry) => !removedIds.has(entry.offeringId)));
    setDialog(null);
    toast.success(`${offeringTermLabel(term)} removed from ${yearLabel}.`);
    focusLater("sections-add-term");
  }

  function addSubjects(term: OfferingTerm, codes: readonly string[]) {
    const added = codes.map((subjectCode) => ({
      id: globalThis.crypto.randomUUID(),
      yearLevel,
      term,
      subjectCode,
    }));
    setOfferings((current) => [...current, ...added]);
    setOpenTerms((current) => new Set(current).add(termKey({ yearLevel, term })));
    setDialog(null);
    toast.success(`${countLabel(added.length, "subject")} added to ${offeringTermLabel(term)}.`);
  }

  function removeSubject(offering: SubjectOffering) {
    setOfferings((current) => current.filter((item) => item.id !== offering.id));
    setEntries((current) => current.filter((entry) => entry.offeringId !== offering.id));
    setDialog(null);
    toast.success(`${offering.subjectCode} removed from ${offeringTermLabel(offering.term)}.`);
    focusLater(`${termDomId(offering)}-toggle`);
  }

  function saveEntry(entry: SectionEntry) {
    const exists = entries.some((item) => item.id === entry.id);
    setEntries((current) => exists ? current.map((item) => item.id === entry.id ? entry : item) : [...current, entry]);
    setOpenOfferings((current) => new Set(current).add(entry.offeringId));
    setDialog(null);
    toast.success(`${entry.subjectCode} ${entry.section} ${classTypeLabels[entry.classType].short} ${exists ? "updated" : "added"}.`);
  }

  function deleteEntry(entry: SectionEntry) {
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setDialog(null);
    toast.success(`${entry.subjectCode} ${entry.section} ${classTypeLabels[entry.classType].short} deleted.`);
    // The deleted row's button is gone; return focus to its subject instead of the page body.
    focusLater(`${subjectSectionsId(entry.offeringId)}-toggle`);
  }

  function renderDialog() {
    if (!dialog) return null;
    switch (dialog.kind) {
      case "add-entry":
      case "edit-entry":
        return (
          <SectionEntryDialog
            key={dialog.kind === "edit-entry" ? dialog.entry.id : `add-${dialog.offering.id}`}
            subject={dialog.subject}
            offering={dialog.offering}
            entry={dialog.kind === "edit-entry" ? dialog.entry : undefined}
            entries={sameTermEntries(dialog.offering.term)}
            onClose={() => setDialog(null)}
            onSave={saveEntry}
          />
        );
      case "delete-entry": {
        const otherType = dialog.entry.classType === "lecture" ? "laboratory" : "lecture";
        return (
          <ConfirmRemovalDialog
            title="Delete section entry?"
            description={`Other entries, including this section’s ${otherType}, will not be affected.`}
            confirmLabel="Delete entry"
            onClose={() => setDialog(null)}
            onConfirm={() => deleteEntry(dialog.entry)}
          />
        );
      }
      case "add-subjects": {
        const offered = new Set(termOfferings(dialog.term).map((offering) => offering.subjectCode));
        return (
          <AddOfferedSubjectsDialog
            termLabel={offeringTermLabel(dialog.term)}
            yearLabel={yearLabel}
            subjects={yearSubjects.filter((subject) => !offered.has(subject.code))}
            onClose={() => setDialog(null)}
            onAdd={(codes) => addSubjects(dialog.term, codes)}
          />
        );
      }
      case "remove-subject": {
        const scheduled = offeringEntries(dialog.offering.id).length;
        return (
          <ConfirmRemovalDialog
            title={`Remove ${dialog.subject.code}?`}
            description={`${dialog.subject.title} will no longer be offered in ${offeringTermLabel(dialog.offering.term)}${
              scheduled > 0 ? `, and its ${countLabel(scheduled, "section entry", "section entries")} will be deleted` : ""
            }.`}
            confirmLabel="Remove subject"
            onClose={() => setDialog(null)}
            onConfirm={() => removeSubject(dialog.offering)}
          />
        );
      }
      case "remove-term": {
        const removedIds = new Set(termOfferings(dialog.term).map((offering) => offering.id));
        const scheduled = entries.filter((entry) => removedIds.has(entry.offeringId)).length;
        const parts = [
          removedIds.size > 0 ? countLabel(removedIds.size, "subject") : null,
          scheduled > 0 ? countLabel(scheduled, "section entry", "section entries") : null,
        ].filter((part) => part !== null);
        return (
          <ConfirmRemovalDialog
            title={`Remove ${offeringTermLabel(dialog.term)}?`}
            description={parts.length > 0
              ? `Its ${parts.join(" and ")} for ${yearLabel} will also be removed.`
              : `${offeringTermLabel(dialog.term)} has no subjects for ${yearLabel} yet.`}
            confirmLabel="Remove semester"
            onClose={() => setDialog(null)}
            onConfirm={() => removeTerm(dialog.term)}
          />
        );
      }
    }
  }

  return (
    <main className="sections-page" aria-labelledby="sections-title">
      <header className="sections-heading">
        <h2 id="sections-title">Manage Sections</h2>
        <p>Add enrollment-ready class offerings only from approved curriculum subjects.</p>
      </header>

      <section className="sections-panel" aria-labelledby="sections-catalog-title">
        <div className="sections-toolbar">
          <div>
            <h3 id="sections-catalog-title">Approved subjects by semester</h3>
            <p>{data.program}</p>
          </div>
          <div className="sections-filters">
            <Select
              value={String(yearLevel)}
              onValueChange={(value) => {
                const level = yearLevels.find((item) => String(item.value) === value);
                if (level) setYearLevel(level.value);
              }}
            >
              <SelectTrigger className="sections-year-trigger" aria-label="Curriculum year level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end" sideOffset={8} className="sections-year-menu">
                {yearLevels.map((level) => (
                  <SelectItem key={level.value} value={String(level.value)} className="sections-year-option">
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sections-catalog">
          {yearTerms.length === 0 && (
            <div className="sections-empty" role="status">
              <CalendarPlus aria-hidden="true" />
              <h4>No semesters yet</h4>
              <p>Add a semester or summer term for {yearLabel}, then choose the subjects to offer.</p>
            </div>
          )}

          {yearTerms.map((group) => {
            const term = offeringTerms.find((item) => item.value === group.term) ?? offeringTerms[0];
            const key = termKey(group);
            const domId = termDomId(group);
            const open = openTerms.has(key);
            const termSubjects = termOfferings(group.term).flatMap((offering) => {
              const subject = subjectsByCode.get(offering.subjectCode);
              return subject ? [{ offering, subject }] : [];
            });
            const units = termSubjects.reduce((sum, { subject }) => sum + subject.units, 0);
            return (
              <section key={key} className="sections-semester" data-expanded={open} aria-label={term.label}>
                <div className="sections-semester-header">
                  <h4 className="sections-semester-heading">
                    <button
                      id={`${domId}-toggle`}
                      type="button"
                      aria-expanded={open}
                      aria-controls={domId}
                      onClick={() => setOpenTerms((current) => toggle(current, key))}
                    >
                      <span className="sections-semester-title">
                        <span className="sections-semester-badge" aria-hidden="true">{term.badge}</span>
                        {term.label}
                      </span>
                      <span className="sections-semester-summary">
                        {countLabel(termSubjects.length, "subject")} · {units} units
                        {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                      </span>
                    </button>
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="sections-remove-button"
                    aria-haspopup="dialog"
                    aria-label={`Remove ${term.label} from ${yearLabel}`}
                    title="Remove semester"
                    onClick={() => setDialog({ kind: "remove-term", term: group.term })}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                {open && (
                  <div id={domId} className="sections-semester-subjects">
                    {termSubjects.length === 0 && (
                      <p className="sections-term-empty">No subjects are offered in {term.label.toLocaleLowerCase()} yet.</p>
                    )}
                    {termSubjects.map(({ offering, subject }) => (
                      <SubjectSections
                        key={offering.id}
                        subject={subject}
                        offering={offering}
                        entries={offeringEntries(offering.id)}
                        expanded={openOfferings.has(offering.id)}
                        onToggle={() => setOpenOfferings((current) => toggle(current, offering.id))}
                        onAdd={() => setDialog({ kind: "add-entry", subject, offering })}
                        onEdit={(entry) => setDialog({ kind: "edit-entry", subject, offering, entry })}
                        onDelete={(entry) => setDialog({ kind: "delete-entry", subject, offering, entry })}
                        onRemove={() => setDialog({ kind: "remove-subject", subject, offering })}
                      />
                    ))}
                    <div className="sections-term-footer">
                      <Button
                        type="button"
                        variant="outline"
                        aria-haspopup="dialog"
                        onClick={() => setDialog({ kind: "add-subjects", term: group.term })}
                      >
                        <BookPlus aria-hidden="true" />
                        Add subjects
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {missingTerms.length > 0 && (
            <div className="sections-add-term">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button id="sections-add-term" type="button" variant="outline">
                    <Plus aria-hidden="true" />
                    Add semester
                    <ChevronDown aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="sections-add-term-menu"
                  onCloseAutoFocus={(event) => {
                    const target = addedTermFocusRef.current;
                    if (!target) return;
                    event.preventDefault();
                    addedTermFocusRef.current = null;
                    focusLater(target);
                  }}
                >
                  {missingTerms.map((term) => (
                    <DropdownMenuItem key={term.value} onSelect={() => addTerm(term.value)}>
                      <span className="sections-semester-badge" aria-hidden="true">{term.badge}</span>
                      {term.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </section>

      {renderDialog()}
    </main>
  );
}
