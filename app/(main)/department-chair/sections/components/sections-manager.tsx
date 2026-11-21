"use client";

import { useEffect, useRef, useState } from "react";
import { BookPlus, CalendarPlus, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  classTypeLabels,
  academicYearLabel,
  compareSectionEntries,
  countLabel,
  formatHours,
  offerableCurricula,
  offeringTermLabel,
  offeringTerms,
  scheduleShortfalls,
  sectionYearLevelLabel,
  sectionYearLevels,
  subjectSectionsId,
  subjectUnits,
  yearOfferingSignature,
} from "@/lib/sections";
import type {
  CrossDepartmentAccess,
  CurriculumYearLevel,
  OfferingTerm,
  OfferingTermGroup,
  SectionEntry,
  SectionsData,
  SectionsManagerProps,
  Subject,
  SubjectOffering,
  YearPublicationStatus,
} from "@/types/sections-exports";
import { AddOfferedSubjectsDialog } from "./add-offered-subjects-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { CrossDepartmentAccessDialog } from "./cross-department-access-dialog";
import { SectionEntryDialog } from "./section-entry-dialog";
import { SubjectSections } from "./subject-sections";
import { YearPublicationBar } from "./year-publication-bar";

type DialogState =
  | { kind: "add-entry"; subject: Subject; offering: SubjectOffering }
  | { kind: "edit-entry" | "delete-entry"; subject: Subject; offering: SubjectOffering; entry: SectionEntry }
  | { kind: "add-subjects"; term: OfferingTerm }
  | { kind: "remove-subject"; subject: Subject; offering: SubjectOffering }
  | { kind: "remove-term"; term: OfferingTerm }
  | { kind: "access"; subject: Subject; offering: SubjectOffering }
  | { kind: "publish" }
  | null;

/** Content signatures of the last saved draft and the version students can see. */
interface YearPublication {
  saved: string;
  published: string | null;
}

const publicationKey = (academicYear: string, yearLevel: CurriculumYearLevel) => `${academicYear}:${yearLevel}`;

/** Publication state per academic year and year level, keyed by publicationKey. */
function initialPublication(data: SectionsData): Record<string, YearPublication> {
  const academicYears = [...new Set(data.academicTerms.map((term) => term.academicYear))];
  return Object.fromEntries(academicYears.flatMap((academicYear) => sectionYearLevels.map(({ value: yearLevel }) => {
    const signature = yearOfferingSignature(data, academicYear, yearLevel);
    const published = data.publishedYearLevels.some((item) => item.academicYear === academicYear && item.yearLevel === yearLevel);
    return [publicationKey(academicYear, yearLevel), { saved: signature, published: published ? signature : null }];
  })));
}

const termKey = (group: OfferingTermGroup) => `${group.academicYear}:${group.yearLevel}:${group.term}`;
const termDomId = (group: OfferingTermGroup) =>
  `sections-term-${group.academicYear.replace(/\D+/g, "-")}-${group.yearLevel}-${group.term}`;
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
  const [academicYear, setAcademicYear] = useState(data.initialAcademicYear);
  const [yearLevel, setYearLevel] = useState<CurriculumYearLevel>(data.initialYearLevel);
  const [openTerms, setOpenTerms] = useState<ReadonlySet<string>>(() => {
    const first = data.termGroups.find((group) =>
      group.academicYear === data.initialAcademicYear && group.yearLevel === data.initialYearLevel,
    );
    return new Set(first ? [termKey(first)] : []);
  });
  const [openOfferings, setOpenOfferings] = useState<ReadonlySet<string>>(() => {
    const first = data.offerings.find((offering) =>
      offering.academicYear === data.initialAcademicYear && offering.yearLevel === data.initialYearLevel,
    );
    return new Set(first ? [first.id] : []);
  });
  const [dialog, setDialog] = useState<DialogState>(null);
  const [publication, setPublication] = useState(() => initialPublication(data));
  // Set when a term is added, so the menu does not return focus to a trigger that may disappear.
  const addedTermFocusRef = useRef<string | null>(null);
  // Access dates are compared with the client's clock after hydration, so server HTML stays stable.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const first = globalThis.setTimeout(update, 0);
    const timer = globalThis.setInterval(update, 30_000);
    return () => {
      globalThis.clearTimeout(first);
      globalThis.clearInterval(timer);
    };
  }, []);

  const subjectsById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const curriculaById = new Map(data.curricula.map((curriculum) => [curriculum.id, curriculum]));
  const activeCurricula = offerableCurricula(data.curricula);
  const subjectCode = (offering: SubjectOffering) => subjectsById.get(offering.subjectId)?.code ?? "Subject";
  const yearLabel = sectionYearLevelLabel(yearLevel);
  const academicYears = [...new Set(data.academicTerms.map((term) => term.academicYear))];
  const inSelection = (group: OfferingTermGroup) => group.academicYear === academicYear && group.yearLevel === yearLevel;
  const yearTerms = termGroups.filter(inSelection).sort((a, b) => termOrder(a.term) - termOrder(b.term));
  // Chairs can only open terms a Dean has created for the selected academic year.
  const deanTerms = data.academicTerms.filter((term) => term.academicYear === academicYear);
  const missingTerms = offeringTerms.filter((term) =>
    deanTerms.some((item) => item.term === term.value) && !yearTerms.some((group) => group.term === term.value),
  );
  const yearOfferings = offerings.filter(inSelection);
  const yearEntries = entries.filter((entry) => yearOfferings.some((offering) => offering.id === entry.offeringId));
  const signature = yearOfferingSignature({ termGroups, offerings, entries }, academicYear, yearLevel);
  const yearPublication = publication[publicationKey(academicYear, yearLevel)] ?? { saved: signature, published: null };
  const publicationStatus: YearPublicationStatus = signature === yearPublication.published
    ? "published"
    : signature === yearPublication.saved ? "draft" : "unsaved";
  const unscheduled = yearOfferings.filter((offering) => !entries.some((entry) => entry.offeringId === offering.id));
  const shortfalls = scheduleShortfalls(yearOfferings, entries, data.subjects);
  const shortfallLabels = shortfalls.map(({ subject, section, classType, scheduled, required }) =>
    `${subject.code} ${section} ${classTypeLabels[classType].short.toLocaleLowerCase()}: ${formatHours(scheduled)} of ${formatHours(required)} ${required === 1 ? "hr" : "hrs"}`,
  );
  const publishBlockers = yearOfferings.length === 0
    ? [`Add at least one subject to ${yearLabel} before publishing.`]
    : [
      ...(unscheduled.length > 0
        ? [`Schedule at least one section for ${unscheduled
          .map((offering) => `${subjectCode(offering)} (${offeringTermLabel(offering.term)})`)
          .join(", ")} before publishing.`]
        : []),
      ...(shortfalls.length > 0
        ? [`Schedule the weekly hours each subject's units require (1 unit = 1 hr): ${shortfallLabels.slice(0, 3).join("; ")}${
          shortfalls.length > 3 ? `; and ${shortfalls.length - 3} more` : ""}.`]
        : []),
    ];

  const termOfferings = (term: OfferingTerm) =>
    offerings.filter((offering) => inSelection(offering) && offering.term === term);
  const offeringEntries = (offeringId: string) =>
    entries.filter((entry) => entry.offeringId === offeringId).sort(compareSectionEntries);
  // Rooms, section blocks, and faculty are shared by every year level in the same academic term.
  const sameTermEntries = (offering: SubjectOffering) => {
    const ids = new Set(offerings
      .filter((item) => item.academicYear === offering.academicYear && item.term === offering.term)
      .map((item) => item.id));
    return entries.filter((entry) => ids.has(entry.offeringId));
  };

  function addTerm(term: OfferingTerm) {
    const group = { academicYear, yearLevel, term };
    setTermGroups((current) => [...current, group]);
    setOpenTerms((current) => new Set(current).add(termKey(group)));
    toast.success(`${offeringTermLabel(term)} added to ${yearLabel}.`);
    // Adding the last missing term unmounts the menu, so no close event will move focus.
    if (missingTerms.length === 1) focusLater(`${termDomId(group)}-toggle`);
    else addedTermFocusRef.current = `${termDomId(group)}-toggle`;
  }

  function removeTerm(term: OfferingTerm) {
    const removedIds = new Set(termOfferings(term).map((offering) => offering.id));
    setTermGroups((current) => current.filter((group) => !(inSelection(group) && group.term === term)));
    setOfferings((current) => current.filter((offering) => !removedIds.has(offering.id)));
    setEntries((current) => current.filter((entry) => !removedIds.has(entry.offeringId)));
    setDialog(null);
    toast.success(`${offeringTermLabel(term)} removed from ${yearLabel}.`);
    focusLater("sections-add-term");
  }

  function addSubjects(term: OfferingTerm, subjectIds: readonly string[]) {
    const added = subjectIds.map((subjectId): SubjectOffering => ({
      id: globalThis.crypto.randomUUID(),
      academicYear,
      yearLevel,
      term,
      subjectId,
      // New offerings start reserved; the chair chooses when other departments can enroll.
      crossDepartmentAccess: { mode: "reserved" },
    }));
    setOfferings((current) => [...current, ...added]);
    setOpenTerms((current) => new Set(current).add(termKey({ academicYear, yearLevel, term })));
    setDialog(null);
    toast.success(`${countLabel(added.length, "subject")} added to ${offeringTermLabel(term)}.`);
  }

  function removeSubject(offering: SubjectOffering) {
    setOfferings((current) => current.filter((item) => item.id !== offering.id));
    setEntries((current) => current.filter((entry) => entry.offeringId !== offering.id));
    setDialog(null);
    toast.success(`${subjectCode(offering)} removed from ${offeringTermLabel(offering.term)}.`);
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

  function saveAccess(offering: SubjectOffering, access: CrossDepartmentAccess) {
    setOfferings((current) => current.map((item) => item.id === offering.id ? { ...item, crossDepartmentAccess: access } : item));
    setDialog(null);
    toast.success(`${subjectCode(offering)} access for other departments updated.`);
  }

  function saveDraft() {
    const key = publicationKey(academicYear, yearLevel);
    setPublication((current) => ({ ...current, [key]: { published: current[key]?.published ?? null, saved: signature } }));
    toast.success(`${yearLabel} draft saved.`);
  }

  function publish() {
    setPublication((current) => ({ ...current, [publicationKey(academicYear, yearLevel)]: { saved: signature, published: signature } }));
    setDialog(null);
    toast.success(`${yearLabel} sections published for ${academicYearLabel(academicYear)}.`);
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
            entries={sameTermEntries(dialog.offering)}
            faculty={data.faculty}
            onClose={() => setDialog(null)}
            onSave={saveEntry}
          />
        );
      case "access":
        return (
          <CrossDepartmentAccessDialog
            subject={dialog.subject}
            offering={dialog.offering}
            department={data.department}
            onClose={() => setDialog(null)}
            onSave={(access) => saveAccess(dialog.offering, access)}
          />
        );
      case "publish": {
        const unassigned = yearEntries.filter((entry) => entry.facultyId === null).length;
        const termNames = yearTerms.map((group) => offeringTermLabel(group.term)).join(", ");
        return (
          <ConfirmDialog
            title={`Publish ${yearLabel} sections?`}
            description={`Students will see ${countLabel(yearOfferings.length, "subject")} and ${countLabel(yearEntries.length, "section entry", "section entries")} in ${termNames}, ${academicYearLabel(academicYear)}, when they enroll.`}
            details={unassigned > 0 ? [`${countLabel(unassigned, "section entry", "section entries")} ${unassigned === 1 ? "has" : "have"} no faculty member assigned.`] : []}
            confirmLabel="Publish"
            tone="primary"
            onClose={() => setDialog(null)}
            onConfirm={publish}
          />
        );
      }
      case "delete-entry": {
        const otherType = dialog.entry.classType === "lecture" ? "laboratory" : "lecture";
        return (
          <ConfirmDialog
            title="Delete section entry?"
            description={`Other entries, including this section’s ${otherType}, will not be affected.`}
            confirmLabel="Delete entry"
            tone="destructive"
            onClose={() => setDialog(null)}
            onConfirm={() => deleteEntry(dialog.entry)}
          />
        );
      }
      case "add-subjects":
        return (
          <AddOfferedSubjectsDialog
            term={dialog.term}
            yearLevel={yearLevel}
            termLabel={offeringTermLabel(dialog.term)}
            yearLabel={yearLabel}
            curricula={activeCurricula}
            subjects={data.subjects}
            offeredSubjectIds={new Set(termOfferings(dialog.term).map((offering) => offering.subjectId))}
            onClose={() => setDialog(null)}
            onAdd={(subjectIds) => addSubjects(dialog.term, subjectIds)}
          />
        );
      case "remove-subject": {
        const scheduled = offeringEntries(dialog.offering.id).length;
        return (
          <ConfirmDialog
            title={`Remove ${dialog.subject.code}?`}
            description={`${dialog.subject.title} will no longer be offered in ${offeringTermLabel(dialog.offering.term)}${
              scheduled > 0 ? `, and its ${countLabel(scheduled, "section entry", "section entries")} will be deleted` : ""
            }.`}
            confirmLabel="Remove subject"
            tone="destructive"
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
          <ConfirmDialog
            title={`Remove ${offeringTermLabel(dialog.term)}?`}
            description={parts.length > 0
              ? `Its ${parts.join(" and ")} for ${yearLabel} will also be removed.`
              : `${offeringTermLabel(dialog.term)} has no subjects for ${yearLabel} yet.`}
            confirmLabel="Remove semester"
            tone="destructive"
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
            <p>{data.program.shortName}</p>
          </div>
          <div className="sections-filters">
            <Select
              value={academicYear}
              onValueChange={(value) => {
                if (academicYears.includes(value)) setAcademicYear(value);
              }}
            >
              <SelectTrigger className="sections-year-trigger" aria-label="Academic year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end" sideOffset={8} className="sections-year-menu">
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year} className="sections-year-option">
                    {academicYearLabel(year)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(yearLevel)}
              onValueChange={(value) => {
                const level = sectionYearLevels.find((item) => String(item.value) === value);
                if (level) setYearLevel(level.value);
              }}
            >
              <SelectTrigger className="sections-year-trigger" aria-label="Curriculum year level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end" sideOffset={8} className="sections-year-menu">
                {sectionYearLevels.map((level) => (
                  <SelectItem key={level.value} value={String(level.value)} className="sections-year-option">
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <YearPublicationBar
          yearLabel={yearLabel}
          status={publicationStatus}
          everPublished={yearPublication.published !== null}
          blockers={publishBlockers}
          onSaveDraft={saveDraft}
          onPublish={() => setDialog({ kind: "publish" })}
        />

        <div className="sections-catalog">
          {yearTerms.length === 0 && (
            <div className="sections-empty" role="status">
              <CalendarPlus aria-hidden="true" />
              <h4>No semesters yet</h4>
              <p>
                {deanTerms.length > 0
                  ? `Add a semester or summer term for ${yearLabel}, then choose the subjects to offer.`
                  : `No academic terms have been created for ${academicYearLabel(academicYear)} yet. A Dean creates them.`}
              </p>
            </div>
          )}

          {yearTerms.map((group) => {
            const term = offeringTerms.find((item) => item.value === group.term) ?? offeringTerms[0];
            const key = termKey(group);
            const domId = termDomId(group);
            const open = openTerms.has(key);
            const termSubjects = termOfferings(group.term).flatMap((offering) => {
              const subject = subjectsById.get(offering.subjectId);
              const curriculum = subject && curriculaById.get(subject.curriculumId);
              return subject && curriculum ? [{ offering, subject, curriculum }] : [];
            });
            const units = termSubjects.reduce((sum, { subject }) => sum + subjectUnits(subject), 0);
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
                    {termSubjects.map(({ offering, subject, curriculum }) => (
                      <SubjectSections
                        key={offering.id}
                        subject={subject}
                        curriculum={curriculum}
                        faculty={data.faculty}
                        offering={offering}
                        now={now}
                        entries={offeringEntries(offering.id)}
                        expanded={openOfferings.has(offering.id)}
                        onToggle={() => setOpenOfferings((current) => toggle(current, offering.id))}
                        onAdd={() => setDialog({ kind: "add-entry", subject, offering })}
                        onEdit={(entry) => setDialog({ kind: "edit-entry", subject, offering, entry })}
                        onDelete={(entry) => setDialog({ kind: "delete-entry", subject, offering, entry })}
                        onRemove={() => setDialog({ kind: "remove-subject", subject, offering })}
                        onEditAccess={() => setDialog({ kind: "access", subject, offering })}
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
