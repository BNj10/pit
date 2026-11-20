"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarPlus, Check, Clock3, Pencil, Plus, Users } from "lucide-react";
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
  evaluationTermLabel,
  formatEvaluationDate,
  nextEvaluationWindowDraft,
} from "@/lib/faculty-evaluation";
import type { EvaluationWindowStatus } from "@/types/faculty-evaluation-types";

export function EvaluationWindowSettings() {
  const { data, window, status, saveWindow, closeWindow } = useEvaluation();
  const newDraft = () => nextEvaluationWindowDraft(data.academicYears, data.currentAcademicYear, window);
  const [draft, setDraft] = useState(() => window ?? newDraft());
  const [error, setError] = useState<string | null>(null);
  // "view" shows the saved window read-only; "create" starts a new window
  // after the previous one closed or when none exists yet.
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const editing = mode !== "view";
  const showEmptyState = mode === "view" && (window === null || status === "Closed");
  const closesAtRef = useRef<HTMLInputElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"year" | "create" | null>(null);
  const availability =
    mode === "create" || !window
      ? "Not saved yet. Choose the dates, then save to schedule this window."
      : status === null
        ? "Checking the saved schedule…"
        : `Available from ${formatEvaluationDate(window.opensAt)} to ${formatEvaluationDate(window.closesAt)}`;
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
      closesAtRef.current?.focus();
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
                  The {evaluationTermLabel(window)} window{" "}
                  {window.manuallyClosed ? "was closed early" : `closed on ${formatEvaluationDate(window.closesAt)}`}.
                  <br />
                  Its results are listed in Previous semester results. Create a window to start the next evaluation.
                </>
              ) : (
                <>
                  There is no instructor evaluation window that has been created for the active term.
                  <br />
                  Create one to set when evaluations open for a semester.
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
            <Label htmlFor="evaluation-opens-at">Opens on</Label>
            <Input
              id="evaluation-opens-at"
              type="datetime-local"
              required
              disabled={!editing}
              value={draft.opensAt}
              onChange={(event) => {
                setError(null);
                setDraft((current) => ({ ...current, opensAt: event.target.value }));
              }}
              aria-describedby="evaluation-timezone"
            />
          </div>
          <div className="faculty-evaluation-field">
            <Label htmlFor="evaluation-closes-at">Closes on</Label>
            <Input
              ref={closesAtRef}
              id="evaluation-closes-at"
              type="datetime-local"
              required
              disabled={!editing}
              value={draft.closesAt}
              onChange={(event) => {
                setError(null);
                setDraft((current) => ({ ...current, closesAt: event.target.value }));
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "evaluation-window-error evaluation-timezone" : "evaluation-timezone"}
            />
            {error && <p id="evaluation-window-error" className="faculty-evaluation-error" role="alert">{error}</p>}
          </div>
        </div>
        <p id="evaluation-timezone" className="sr-only">Times use school time, Asia/Manila (UTC+08:00).</p>

        <p className="evaluation-window-availability" data-status={mode === "create" ? "Scheduled" : status ?? undefined} role="status" aria-live="polite" aria-atomic="true">
          <Clock3 aria-hidden="true" />
          {availability}
        </p>

        <div className="evaluation-window-footer">
          <div>
            <h4>Open now or schedule ahead</h4>
            <p>Save future dates to schedule opening; edit dates to adjust this window.</p>
          </div>
          <div className="evaluation-window-footer-actions">
            {editing ? (
              <Button type="button" variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" disabled={status === null || status === "Closed"}>
                    Close evaluations
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close evaluations now?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Stop new submissions{window ? ` for ${evaluationTermLabel(window)}` : ""} immediately. Submitted evaluations will be kept.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep window open</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        pendingFocus.current = "create";
                        closeWindow();
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
        <p>Set when evaluations become available for the selected semester.</p>
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
