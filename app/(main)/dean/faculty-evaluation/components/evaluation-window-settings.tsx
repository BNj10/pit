"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarPlus, Check, CircleCheck, CircleDashed, Clock3, Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currentEvaluationDay,
  evaluationTermId,
  evaluationTermLabel,
  formatEvaluationDay,
  nextEvaluationWindowDraft,
} from "@/lib/faculty-evaluation";
import { evaluationTermCompletion } from "@/lib/faculty-evaluation-results";
import type { EvaluationWindowStatus } from "@/types/faculty-evaluation-types";

const count = (value: number) => value.toLocaleString("en-US");

export function EvaluationWindowSettings() {
  const { data, window, status, submissions, archivedResultIds, saveWindow, closeWindow } = useEvaluation();
  // New windows start today by default, so saving opens evaluations immediately.
  const newDraft = () => ({
    ...nextEvaluationWindowDraft(data.academicYears, data.currentAcademicYear, window),
    opensAt: currentEvaluationDay(Date.now()),
  });
  const [draft, setDraft] = useState(() => window ?? newDraft());
  const [error, setError] = useState<string | null>(null);
  // "view" shows the saved window read-only; "create" starts a new window
  // after the previous one closed or when none exists yet.
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const editing = mode !== "view";
  const showEmptyState = mode === "view" && (window === null || status === "Closed");
  const opensAtRef = useRef<HTMLInputElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"year" | "create" | null>(null);
  const availability =
    mode === "create" || !window
      ? "Not saved yet. Choose the start day, then save. There is no end date."
      : status === null
        ? "Checking the saved schedule…"
        : status === "Scheduled"
          ? `Starts on ${formatEvaluationDay(window.opensAt)} · Stays open until you close it.`
          : `Open since ${formatEvaluationDay(window.opensAt)} · Close it once every evaluation is in.`;
  // Closing unlocks once every faculty member has student, chair, and dean evaluations.
  const completion = window ? evaluationTermCompletion(data, window, submissions) : null;
  const completionItems = completion ? [
    {
      label: "Students",
      detail: `${count(completion.studentResponses)} of ${count(completion.studentEnrolled)} responded`,
      done: completion.facultyCount > 0 && completion.studentsComplete === completion.facultyCount,
    },
    {
      label: "Department Chair",
      detail: `${completion.chairComplete} of ${completion.facultyCount} faculty evaluated`,
      done: completion.facultyCount > 0 && completion.chairComplete === completion.facultyCount,
    },
    {
      label: "College Dean",
      detail: `${completion.deanComplete} of ${completion.facultyCount} faculty evaluated`,
      done: completion.facultyCount > 0 && completion.deanComplete === completion.facultyCount,
    },
  ] : [];
  const badge = status === null ? "Checking…" : mode === "create" ? "New" : window ? status : "Not set";

  // Switching between the empty state and the form unmounts the focused
  // button, so move focus to the control that replaces it.
  useEffect(() => {
    const target =
      pendingFocus.current === "year"
        ? yearTriggerRef
        : pendingFocus.current === "create"
          ? createButtonRef
          : null;
    target?.current?.focus();
    pendingFocus.current = null;
  }, [mode, showEmptyState]);

  function startCreating() {
    setDraft(newDraft());
    setError(null);
    pendingFocus.current = "year";
    setMode("create");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      setMode("edit");
      return;
    }
    const next = { ...draft, manuallyClosed: false };
    const problem = saveWindow(next);
    setError(problem);
    if (problem) {
      opensAtRef.current?.focus();
      return;
    }
    setDraft(next);
    setMode("view");
    toast.success(mode === "create" ? "Evaluation window created." : "Evaluation window saved.");
  }

  function cancelEditing() {
    if (mode === "create") pendingFocus.current = "create";
    setDraft(window ?? newDraft());
    setError(null);
    setMode("view");
  }

  if (showEmptyState) {
    return (
      <section className="faculty-evaluation-panel evaluation-window-card" aria-labelledby="evaluation-window-title">
        <div className="evaluation-window-settings-form">
          <EvaluationWindowHeading badge={badge} status={status} />
          <div className="evaluation-window-empty">
            <span className="evaluation-window-empty-icon" aria-hidden="true">
              <CalendarPlus />
            </span>
            <h4>{window ? "No evaluation window open" : "No evaluation window yet"}</h4>
            <p className="evaluation-window-empty-description">
              {window ? (
                <>
                  The {evaluationTermLabel(window)} window was closed.
                  <br />
                  {archivedResultIds.includes(evaluationTermId(window))
                    ? "Its results are archived; choose Show archived in Previous semester results to see them."
                    : "Its results are listed in Previous semester results."}{" "}
                  Create a window to start the next evaluation.
                </>
              ) : (
                <>
                  There is no instructor evaluation window that has been created for the active term.
                  <br />
                  Create one to set when evaluations start for a semester.
                </>
              )}
            </p>
            <Button ref={createButtonRef} type="button" className="evaluation-window-create" onClick={startCreating}>
              <Plus aria-hidden="true" />
              Create evaluation window
            </Button>
            <p className="evaluation-window-empty-note">Only the dean can create evaluation windows.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="faculty-evaluation-panel evaluation-window-card" aria-labelledby="evaluation-window-title">
      <form className="evaluation-window-settings-form" onSubmit={save}>
        <EvaluationWindowHeading badge={badge} status={mode === "create" ? "Scheduled" : status} />

        <div className="evaluation-window-field-grid">
          <div className="faculty-evaluation-field">
            <Label htmlFor="evaluation-academic-year">Academic year</Label>
            <Select
              disabled={!editing}
              value={draft.academicYear}
              onValueChange={(academicYear) => {
                setError(null);
                setDraft((current) => ({ ...current, academicYear }));
              }}
            >
              <SelectTrigger ref={yearTriggerRef} id="evaluation-academic-year">
                <SelectValue>{draft.academicYear}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {data.academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}{year === data.currentAcademicYear ? " · Current" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="faculty-evaluation-field">
            <Label htmlFor="evaluation-semester">Semester</Label>
            <Select
              disabled={!editing}
              value={draft.semester}
              onValueChange={(semester) => {
                if (semester === "first" || semester === "second") {
                  setError(null);
                  setDraft((current) => ({ ...current, semester }));
                }
              }}
            >
              <SelectTrigger id="evaluation-semester">
                <SelectValue>{draft.semester === "first" ? "1st semester" : "2nd semester"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">1st semester</SelectItem>
                <SelectItem value="second">2nd semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="faculty-evaluation-field">
            <Label htmlFor="evaluation-opens-at">Starts on</Label>
            <Input
              ref={opensAtRef}
              id="evaluation-opens-at"
              type="date"
              required
              disabled={!editing}
              // Older windows stored a date and time; the day is what matters now.
              value={draft.opensAt.slice(0, 10)}
              onChange={(event) => {
                setError(null);
                setDraft((current) => ({ ...current, opensAt: event.target.value }));
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "evaluation-window-error evaluation-opens-at-hint" : "evaluation-opens-at-hint"}
            />
            <p id="evaluation-opens-at-hint" className="evaluation-window-field-hint">
              Evaluations open at the start of this day (school time, Asia/Manila) and stay open until you close them.
            </p>
            {error && <p id="evaluation-window-error" className="faculty-evaluation-error" role="alert">{error}</p>}
          </div>
        </div>

        <p className="evaluation-window-availability" data-status={mode === "create" ? "Scheduled" : status ?? undefined} role="status" aria-live="polite" aria-atomic="true">
          <Clock3 aria-hidden="true" />
          {availability}
        </p>

        {!editing && completion && (
          <ul id="evaluation-window-completion" className="evaluation-window-completion" aria-label="Evaluation completion">
            {completionItems.map((item) => (
              <li key={item.label} data-done={item.done}>
                {item.done ? <CircleCheck aria-hidden="true" /> : <CircleDashed aria-hidden="true" />}
                <span><strong>{item.label}:</strong> {item.detail}</span>
                <span className="sr-only">{item.done ? "Complete" : "Pending"}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="evaluation-window-footer">
          <div>
            <h4>Start now or schedule ahead</h4>
            <p>
              Choose today to open now, or a later day to schedule. There is no end date; close evaluations once every
              faculty member has student, Department Chair, and College Dean evaluations.
            </p>
          </div>
          <div className="evaluation-window-footer-actions">
            {editing ? (
              <Button type="button" variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="evaluation-window-close-link"
                    disabled={status === null || status === "Closed" || !completion?.complete}
                    aria-describedby={completion ? "evaluation-window-completion" : undefined}
                  >
                    Close evaluations
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close evaluations now?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Every evaluation is in{window ? ` for ${evaluationTermLabel(window)}` : ""}. Closing stops new
                      submissions and moves the results to Previous semester results.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep window open</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const problem = closeWindow();
                        if (problem) {
                          toast.error(problem);
                          return;
                        }
                        pendingFocus.current = "create";
                        setDraft((current) => ({ ...current, manuallyClosed: true }));
                        toast.success("Evaluations closed.");
                      }}
                    >
                      Close evaluations
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* One submit button toggles edit/save so keyboard focus stays in place. */}
            <Button type="submit">
              {mode === "create" ? "Create window" : editing ? "Save window" : "Edit window"}
              {editing ? <Check aria-hidden="true" /> : <Pencil aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function EvaluationWindowHeading({
  badge,
  status,
}: {
  badge: string;
  status: EvaluationWindowStatus | null;
}) {
  return (
    <header className="evaluation-window-heading">
      <div>
        <h3 id="evaluation-window-title">Semester evaluation window</h3>
        <p>Set when evaluations start for the selected semester.</p>
      </div>
      <div className="evaluation-window-heading-actions">
        <Button asChild variant="outline" className="faculty-evaluation-instructors-button">
          <Link href="/dean/faculty-evaluation/instructors">
            <Users aria-hidden="true" />
            View instructors
          </Link>
        </Button>
        <span className="evaluation-window-badge" data-status={status ?? undefined}>
          {badge}
        </span>
      </div>
    </header>
  );
}
