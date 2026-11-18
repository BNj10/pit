"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileQuestion, Lock, Pencil, Plus, Search, SearchX, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { PortalBreadcrumbLabel } from "@/components/shared/sidebar/portal-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isSameTerm,
  isSemester,
  semesterLabel,
  semesters,
  sortSubjects,
  subjectDependents,
  summarizeSubjects,
  termLabel,
  yearLevelLabel,
} from "@/lib/curriculum-subjects";
import type { CurriculumTerm, Subject, SubjectDetails } from "@/types/curriculum-types";
import { useCurricula } from "../../components/curricula-provider";
import { focusById, useManagedDialog } from "../../components/use-managed-dialog";
import { DeleteSubjectDialog } from "./delete-subject-dialog";
import { SubjectFormDialog } from "./subject-form-dialog";

type DialogState = { kind: "add" } | { kind: "edit" | "delete"; subject: Subject };

const curriculaHref = "/department-chair/curricula-and-subjects";
const addButtonId = "subject-add-button";
const tableRegionId = "subject-table-region";
const searchId = "subject-search";
const codeId = (id: string) => `subject-${id}-code`;
const actionId = (id: string, action: string) => `subject-${id}-${action}`;

/** Reads the viewed term from the URL, falling back to 1st year · 1st semester. */
function useViewedTerm(yearLevels: number) {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year"));
  const semester = searchParams.get("semester");
  const term: CurriculumTerm = {
    yearLevel: Number.isInteger(year) && year >= 1 && year <= yearLevels ? year : 1,
    semester: isSemester(semester) ? semester : "first",
  };

  // Native history updates keep the view in the URL without a server round trip.
  function setTerm(next: CurriculumTerm) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(next.yearLevel));
    params.set("semester", next.semester);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  return [term, setTerm] as const;
}

export function CurriculumSubjects({ curriculumId }: { curriculumId: string }) {
  const { program, curricula, subjects, addSubject, updateSubject, deleteSubject } = useCurricula();
  const curriculum = curricula.find((item) => item.id === curriculumId);
  const [term, setTerm] = useViewedTerm(program.yearLevels);
  const [query, setQuery] = useState("");
  const { dialog, openDialog, closeDialog, focusAfterRender, dialogProps } = useManagedDialog<DialogState>(tableRegionId);

  if (!curriculum) {
    return (
      <main className="curriculum-subjects-page" aria-labelledby="curriculum-subjects-title">
        <PortalBreadcrumbLabel label="Curriculum not found" />
        <div className="subject-not-found">
          <FileQuestion aria-hidden="true" />
          <h2 id="curriculum-subjects-title">Curriculum not found</h2>
          <p>This curriculum does not exist in your assigned degree program, or it was deleted.</p>
          <Button asChild variant="outline">
            <Link href={curriculaHref}>
              <ArrowLeft aria-hidden="true" />
              All curricula
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const editable = curriculum.status === "Draft";
  const curriculumSubjects = subjects.filter((subject) => subject.curriculumId === curriculum.id);
  const codes = new Map(curriculumSubjects.map((subject) => [subject.id, subject.code]));
  const termSubjects = sortSubjects(curriculumSubjects.filter((subject) => isSameTerm(subject, term)));
  const summary = summarizeSubjects(termSubjects);
  const search = query.trim().toLocaleLowerCase();
  const visible = termSubjects.filter(
    (subject) => !search || `${subject.code} ${subject.title}`.toLocaleLowerCase().includes(search),
  );
  const viewLabel = termLabel(term);
  const termNoun = term.semester === "summer" ? "this summer term" : "this semester";
  const columnCount = editable ? 8 : 7;

  function requisiteCodes(ids: readonly string[]) {
    return ids.map((id) => codes.get(id)).filter(Boolean).join(", ") || "None";
  }

  function showTerm(next: CurriculumTerm) {
    if (!isSameTerm(next, term)) setTerm(next);
  }

  function saveNewSubject(details: SubjectDetails) {
    const subject = addSubject(curriculum!.id, details);
    // Show the term the subject was added to, then focus its row.
    showTerm(subject);
    setQuery("");
    closeDialog(codeId(subject.id));
    toast.success(`${subject.code} was added to ${termLabel(subject)}.`);
  }

  function saveSubject(subject: Subject, details: SubjectDetails) {
    updateSubject(subject.id, details);
    const moved = !isSameTerm(subject, details);
    if (moved) {
      showTerm(details);
      setQuery("");
    }
    closeDialog(moved ? codeId(subject.id) : actionId(subject.id, "edit"));
    toast.success(`${details.code} was updated${moved ? ` and moved to ${termLabel(details)}` : ""}.`);
  }

  function removeSubject(subject: Subject) {
    deleteSubject(subject.id);
    closeDialog(tableRegionId);
    toast.success(`${subject.code} was deleted from ${curriculum!.name}.`);
  }

  const addButton = (id?: string) => (
    <Button id={id} type="button" onClick={() => openDialog({ kind: "add" }, id ?? addButtonId)}>
      Add subject
      <Plus aria-hidden="true" />
    </Button>
  );

  const termBody = (
    <>
      <div className="subject-term-heading">
        <h3 id="subject-term-title">{viewLabel}</h3>
        <p className="subject-term-summary">
          {summary.count} {summary.count === 1 ? "subject" : "subjects"} · {summary.units}{" "}
          {summary.units === 1 ? "unit" : "units"}
        </p>
      </div>
      <div className="subject-toolbar">
        <div className="subject-semester-select">
          <label htmlFor="subject-semester-filter" className="sr-only">Semester</label>
          <Select
            value={term.semester}
            onValueChange={(value) => {
              if (isSemester(value)) showTerm({ ...term, semester: value });
            }}
          >
            <SelectTrigger id="subject-semester-filter" className="subject-select">
              <SelectValue>{semesterLabel(term.semester)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester.value} value={semester.value}>{semester.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="curriculum-search" role="search">
          <Search aria-hidden="true" />
          <label htmlFor={searchId} className="sr-only">Search subject code or title in {viewLabel}</label>
          <Input
            id={searchId}
            type="search"
            value={query}
            placeholder="Search subject code or title"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear subject search"
              onClick={() => {
                setQuery("");
                focusById(searchId, tableRegionId);
              }}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <Table
        className={`subject-table${editable ? "" : " subject-table-readonly"}${visible.length === 0 ? " subject-table-empty" : ""}`}
        containerProps={{ id: tableRegionId, tabIndex: 0, role: "region", "aria-label": `Subjects in ${viewLabel}` }}
      >
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Code</TableHead>
            <TableHead scope="col">Subject title</TableHead>
            <TableHead scope="col" className="subject-number">Units</TableHead>
            <TableHead scope="col" className="subject-number"><abbr title="Lecture units">Lec</abbr></TableHead>
            <TableHead scope="col" className="subject-number"><abbr title="Laboratory units">Lab</abbr></TableHead>
            <TableHead scope="col">Prerequisite</TableHead>
            <TableHead scope="col">Corequisite</TableHead>
            {editable && <TableHead scope="col" className="subject-actions-cell">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>
                <span id={codeId(subject.id)} tabIndex={-1} className="subject-code">{subject.code}</span>
              </TableCell>
              <TableCell className="subject-title">{subject.title}</TableCell>
              <TableCell className="subject-number">{subject.units}</TableCell>
              <TableCell className="subject-number">{subject.lectureUnits}</TableCell>
              <TableCell className="subject-number">{subject.laboratoryUnits}</TableCell>
              <TableCell className="subject-requisites">{requisiteCodes(subject.prerequisiteIds)}</TableCell>
              <TableCell className="subject-requisites">{requisiteCodes(subject.corequisiteIds)}</TableCell>
              {editable && (
                <TableCell className="subject-actions-cell">
                  <div className="subject-actions">
                    <Button
                      id={actionId(subject.id, "edit")}
                      type="button"
                      variant="outline"
                      aria-label={`Edit ${subject.code}`}
                      onClick={() => openDialog({ kind: "edit", subject }, actionId(subject.id, "edit"))}
                    >
                      <Pencil aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      id={actionId(subject.id, "delete")}
                      type="button"
                      variant="outline"
                      className="curriculum-delete-action"
                      aria-label={`Delete ${subject.code}`}
                      onClick={() => openDialog({ kind: "delete", subject }, actionId(subject.id, "delete"))}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <div className="curriculum-empty">
                  {search ? (
                    <>
                      <span className="curriculum-empty-icon" aria-hidden="true"><SearchX /></span>
                      <h3>No subjects match</h3>
                      <p>Try another subject code or title in {viewLabel}.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setQuery("");
                          focusAfterRender(searchId);
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="curriculum-empty-icon" aria-hidden="true"><BookOpen /></span>
                      <h3>No subjects in {viewLabel}</h3>
                      <p>
                        {editable
                          ? "Add the subjects students take in this term."
                          : "This curriculum has no subjects in this term."}
                      </p>
                      {editable && addButton("subject-empty-add-button")}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <footer className="curriculum-footer">
        <p role="status" aria-live="polite" aria-atomic="true">
          {visible.length === termSubjects.length
            ? `Showing ${termSubjects.length} ${termSubjects.length === 1 ? "subject" : "subjects"} in ${termNoun}`
            : `Showing ${visible.length} of ${termSubjects.length} subjects in ${termNoun}`}
        </p>
        <p>LEC / LAB = lecture / laboratory units</p>
      </footer>
    </>
  );

  return (
    <main className="curriculum-subjects-page" aria-labelledby="curriculum-subjects-title">
      <PortalBreadcrumbLabel label={curriculum.name} />
      <div className="curriculum-page-heading">
        <div>
          <h2 id="curriculum-subjects-title">{curriculum.name}</h2>
          <p>View and manage subjects by year level and semester.</p>
        </div>
        <div className="subject-page-actions">
          <Button asChild variant="outline">
            <Link href={curriculaHref}>
              <ArrowLeft aria-hidden="true" />
              All curricula
            </Link>
          </Button>
          {editable && addButton(addButtonId)}
        </div>
      </div>

      {!editable && (
        <p className="subject-readonly-note" role="note">
          <Lock aria-hidden="true" />
          {curriculum.status === "Active"
            ? "Active curricula are read-only. Deactivate it from All curricula to edit subjects."
            : "Archived curricula are read-only. Restore it to draft from All curricula to edit subjects."}
        </p>
      )}

      <section className="curriculum-panel subject-panel" aria-labelledby="subject-term-title">
        <Tabs
          value={String(term.yearLevel)}
          onValueChange={(value) => showTerm({ ...term, yearLevel: Number(value) })}
        >
          <TabsList variant="line" className="subject-year-tabs" aria-label="Year level">
            {Array.from({ length: program.yearLevels }, (_, index) => index + 1).map((yearLevel) => (
              <TabsTrigger key={yearLevel} value={String(yearLevel)} className="subject-year-tab">
                {yearLevelLabel(yearLevel)}
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from({ length: program.yearLevels }, (_, index) => index + 1).map((yearLevel) => (
            <TabsContent key={yearLevel} value={String(yearLevel)} className="subject-term-panel">
              {yearLevel === term.yearLevel && termBody}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {dialog?.kind === "add" && (
        <SubjectFormDialog
          {...dialogProps}
          curriculumSubjects={curriculumSubjects}
          yearLevels={program.yearLevels}
          defaultTerm={term}
          onSubmit={saveNewSubject}
        />
      )}
      {dialog?.kind === "edit" && (
        <SubjectFormDialog
          {...dialogProps}
          curriculumSubjects={curriculumSubjects}
          yearLevels={program.yearLevels}
          defaultTerm={term}
          subject={dialog.subject}
          onSubmit={(details) => saveSubject(dialog.subject, details)}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteSubjectDialog
          {...dialogProps}
          program={program}
          curriculum={curriculum}
          subject={dialog.subject}
          dependents={subjectDependents(dialog.subject.id, curriculumSubjects)}
          onConfirm={() => removeSubject(dialog.subject)}
        />
      )}
    </main>
  );
}
