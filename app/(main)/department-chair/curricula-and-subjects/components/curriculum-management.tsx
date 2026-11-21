"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUpRight,
  CircleCheck,
  CirclePause,
  FolderPlus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  activeSubjectCodeConflicts,
  canArchiveCurriculum,
  canDeleteCurriculum,
  canEditCurriculum,
  curriculumCode,
  curriculumTransitions,
} from "@/lib/curricula";
import { summarizeSubjects } from "@/lib/curriculum-subjects";
import type {
  Curriculum,
  CurriculumDetails,
  CurriculumStatus,
  CurriculumTransition,
} from "@/types/curriculum-types";
import { CurriculumFormDialog } from "./curriculum-form-dialog";
import { useCurricula } from "./curricula-provider";
import { ArchiveCurriculumDialog, DeleteCurriculumDialog } from "./curriculum-removal-dialogs";
import { focusById, useManagedDialog } from "./use-managed-dialog";

type StatusFilter = "all" | CurriculumStatus;
type DialogState =
  | { kind: "add" }
  | { kind: "edit" | "archive" | "delete"; curriculum: Curriculum };

const statusFilters = [
  { value: "all", label: "All curricula" },
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
] as const satisfies readonly { value: StatusFilter; label: string }[];

const transitionLabels = {
  activate: { button: "Activate", icon: CircleCheck, toast: "is now active." },
  deactivate: { button: "Deactivate", icon: CirclePause, toast: "was moved to draft." },
  restore: { button: "Restore to draft", icon: RotateCcw, toast: "was restored to draft." },
} as const satisfies Record<CurriculumTransition, { button: string; icon: unknown; toast: string }>;

const addButtonId = "curriculum-add-button";
const tableRegionId = "curriculum-table-region";
const nameId = (id: string) => `curriculum-${id}-name`;
export const curriculumHref = (id: string) => `/department-chair/curricula-and-subjects/${encodeURIComponent(id)}`;
const actionId = (id: string, action: string) => `curriculum-${id}-${action}`;

// In-memory preview workflow. Identity, persistence, and authoritative
// validation belong to the future authenticated server boundary.
export function CurriculumManagement({
  children,
}: {
  /** Server-rendered guidance shown below the curriculum table. */
  children?: ReactNode;
}) {
  const router = useRouter();
  const { program, curricula, subjects, ...actions } = useCurricula();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const { dialog, openDialog, closeDialog, focusAfterRender, dialogProps: managedDialogProps } =
    useManagedDialog<DialogState>(tableRegionId);

  const search = query.trim().toLocaleLowerCase();
  const sorted = [...curricula].sort((a, b) => b.year - a.year);
  const counts = {
    all: curricula.length,
    Active: curricula.filter((curriculum) => curriculum.status === "Active").length,
    Draft: curricula.filter((curriculum) => curriculum.status === "Draft").length,
    Archived: curricula.filter((curriculum) => curriculum.status === "Archived").length,
  } satisfies Record<StatusFilter, number>;
  const visible = sorted.filter(
    (curriculum) =>
      (filter === "all" || curriculum.status === filter) &&
      (!search || `${curriculum.name} ${curriculumCode(program, curriculum.year)}`.toLocaleLowerCase().includes(search)),
  );
  const filtered = filter !== "all" || search !== "";
  const subjectSummary = (curriculum: Curriculum) =>
    summarizeSubjects(subjects.filter((subject) => subject.curriculumId === curriculum.id));

  function createCurriculum(details: CurriculumDetails) {
    const curriculum = actions.createCurriculum(details);
    closeDialog();
    toast.success(`${curriculum.name} was created as a draft.`);
    // Open the new curriculum so its subjects can be added right away.
    router.push(curriculumHref(curriculum.id));
  }

  function editCurriculum(curriculum: Curriculum, details: CurriculumDetails) {
    actions.updateCurriculum(curriculum.id, details);
    closeDialog(actionId(curriculum.id, "edit"));
    toast.success(`${details.name} was updated.`);
  }

  function archiveCurriculum(curriculum: Curriculum) {
    actions.updateCurriculum(curriculum.id, { status: "Archived" });
    closeDialog(nameId(curriculum.id));
    toast.success(`${curriculum.name} was archived.`);
  }

  function deleteCurriculum(curriculum: Curriculum) {
    actions.deleteCurriculum(curriculum.id);
    closeDialog(tableRegionId);
    toast.success(`${curriculum.name} was permanently deleted.`);
  }

  function transition(curriculum: Curriculum, action: CurriculumTransition) {
    const { from, to } = curriculumTransitions[action];
    if (curriculum.status !== from) return;
    if (action === "activate") {
      const conflicts = activeSubjectCodeConflicts(curriculum.id, curricula, subjects);
      if (conflicts.length > 0) {
        const codes = conflicts.map((conflict) => conflict.code).join(", ");
        const owners = [...new Set(conflicts.map((conflict) => conflict.curriculum.name))].join(" and ");
        toast.error(
          `${curriculum.name} can't be activated: ${codes} ${conflicts.length === 1 ? "is" : "are"} already used by ${owners}. Give revised subjects new codes.`,
        );
        return;
      }
    }
    actions.updateCurriculum(curriculum.id, { status: to });
    focusAfterRender(nameId(curriculum.id));
    toast.success(`${curriculum.name} ${transitionLabels[action].toast}`);
  }

  function clearFilters() {
    setFilter("all");
    setQuery("");
    focusAfterRender("curriculum-search");
  }

  function rowActions(curriculum: Curriculum) {
    const buttons: ReactNode[] = [];
    const transitionAction = (Object.keys(curriculumTransitions) as CurriculumTransition[]).find(
      (action) => curriculumTransitions[action].from === curriculum.status,
    );
    if (transitionAction) {
      const { button, icon: Icon } = transitionLabels[transitionAction];
      buttons.push(
        <Button
          key={transitionAction}
          id={actionId(curriculum.id, transitionAction)}
          type="button"
          variant="outline"
          aria-label={`${button}: ${curriculum.name}`}
          onClick={() => transition(curriculum, transitionAction)}
        >
          <Icon aria-hidden="true" />
          {button}
        </Button>,
      );
    }
    if (canEditCurriculum(curriculum)) {
      buttons.push(
        <Button
          key="edit"
          id={actionId(curriculum.id, "edit")}
          type="button"
          variant="outline"
          aria-label={`Edit ${curriculum.name}`}
          onClick={() => openDialog({ kind: "edit", curriculum }, actionId(curriculum.id, "edit"))}
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>,
      );
    }
    if (canArchiveCurriculum(curriculum)) {
      buttons.push(
        <Button
          key="archive"
          id={actionId(curriculum.id, "archive")}
          type="button"
          variant="outline"
          aria-label={`Archive ${curriculum.name}`}
          onClick={() => openDialog({ kind: "archive", curriculum }, actionId(curriculum.id, "archive"))}
        >
          <Archive aria-hidden="true" />
          Archive
        </Button>,
      );
    }
    if (canDeleteCurriculum(curriculum)) {
      buttons.push(
        <Button
          key="delete"
          id={actionId(curriculum.id, "delete")}
          type="button"
          variant="outline"
          className="curriculum-delete-action"
          aria-label={`Delete ${curriculum.name}`}
          onClick={() => openDialog({ kind: "delete", curriculum }, actionId(curriculum.id, "delete"))}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>,
      );
    }
    return buttons;
  }

  const dialogProps = { ...managedDialogProps, program };

  return (
    <main className="curriculum-management-page" aria-labelledby="curriculum-management-title">
      <div className="curriculum-page-heading">
        <div>
          <h2 id="curriculum-management-title">Curriculum management</h2>
          <p>Create curricula, manage their subjects, and control their lifecycle.</p>
        </div>
        <Button id={addButtonId} type="button" onClick={() => openDialog({ kind: "add" }, addButtonId)}>
          Add curriculum
          <Plus aria-hidden="true" />
        </Button>
      </div>

      <section className="curriculum-panel" aria-label={`${program.name} curricula`}>
        <div className="curriculum-toolbar">
          <div className="curriculum-filters" role="group" aria-label="Filter curricula by status">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                id={`curriculum-filter-${option.value}`}
                type="button"
                className="curriculum-filter"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
                <span className="curriculum-filter-count">{counts[option.value]}</span>
              </button>
            ))}
          </div>
          <div className="curriculum-search" role="search">
            <Search aria-hidden="true" />
            <label htmlFor="curriculum-search" className="sr-only">Search curriculum name or code</label>
            <Input
              id="curriculum-search"
              type="search"
              value={query}
              placeholder="Search curriculum name or code"
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear curriculum search"
                onClick={() => {
                  setQuery("");
                  focusById("curriculum-search", tableRegionId);
                }}
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <Table
          className={`curriculum-table${visible.length === 0 ? " curriculum-table-empty" : ""}`}
          containerProps={{
            id: tableRegionId,
            tabIndex: 0,
            role: "region",
            "aria-label": "Curricula",
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Curriculum name / code</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Total required units</TableHead>
              <TableHead scope="col">Year implemented</TableHead>
              <TableHead scope="col" className="curriculum-actions-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((curriculum) => (
              <TableRow key={curriculum.id}>
                <TableCell>
                  <div className="curriculum-identity">
                    <Link id={nameId(curriculum.id)} href={curriculumHref(curriculum.id)} className="curriculum-name">
                      {curriculum.name}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                    <span className="curriculum-code">{curriculumCode(program, curriculum.year)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="curriculum-status" data-status={curriculum.status}>{curriculum.status}</span>
                </TableCell>
                <TableCell className="curriculum-units">
                  {/* With no subjects there is no total yet; never show 0. */}
                  {subjectSummary(curriculum).count === 0 ? "Not specified" : `${subjectSummary(curriculum).units} units`}
                </TableCell>
                <TableCell className="curriculum-academic-year">
                  {curriculum.implementedYear}
                </TableCell>
                <TableCell className="curriculum-actions-cell">
                  <div className="curriculum-actions">{rowActions(curriculum)}</div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="curriculum-empty">
                    {filtered ? (
                      <>
                        <span className="curriculum-empty-icon" aria-hidden="true"><SearchX /></span>
                        <h3>No curricula match</h3>
                        <p>
                          {search
                            ? "Try another curriculum name or code, or clear the search."
                            : "No curricula have this status."}
                        </p>
                        <Button type="button" variant="outline" onClick={clearFilters}>
                          {search ? "Clear search" : "Show all curricula"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="curriculum-empty-icon" aria-hidden="true"><FolderPlus /></span>
                        <h3>No curricula yet</h3>
                        <p>Add a curriculum for {program.name} to start adding its subjects.</p>
                        <Button type="button" onClick={() => openDialog({ kind: "add" }, addButtonId)}>
                          Add curriculum
                          <Plus aria-hidden="true" />
                        </Button>
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
            {visible.length === curricula.length
              ? `Showing all ${curricula.length} ${curricula.length === 1 ? "curriculum" : "curricula"}`
              : `Showing ${visible.length} of ${curricula.length} curricula`}
          </p>
          <p>Sorted by curriculum year · Newest first</p>
        </footer>
      </section>

      {children}

      {dialog?.kind === "add" && (
        <CurriculumFormDialog {...dialogProps} curricula={curricula} onSubmit={createCurriculum} />
      )}
      {dialog?.kind === "edit" && (
        <CurriculumFormDialog
          {...dialogProps}
          curricula={curricula}
          curriculum={dialog.curriculum}
          onSubmit={(details) => editCurriculum(dialog.curriculum, details)}
        />
      )}
      {dialog?.kind === "archive" && (
        <ArchiveCurriculumDialog
          {...dialogProps}
          curriculum={dialog.curriculum}
          subjectCount={subjectSummary(dialog.curriculum).count}
          onConfirm={() => archiveCurriculum(dialog.curriculum)}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteCurriculumDialog
          {...dialogProps}
          curriculum={dialog.curriculum}
          subjectCount={subjectSummary(dialog.curriculum).count}
          onConfirm={() => deleteCurriculum(dialog.curriculum)}
        />
      )}
    </main>
  );
}
