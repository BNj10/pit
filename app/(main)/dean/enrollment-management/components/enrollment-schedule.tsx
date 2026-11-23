"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { CalendarClock, CalendarPlus, Info, Plus } from "lucide-react";
import { toast } from "sonner";

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { academicTermLabel, academicTermRefLabel, listAcademicTerms } from "@/lib/academic-calendar";
import {
  enrollmentGroupLabel,
  enrollmentWindowStatus,
  enrollmentWindowStatusLabels,
  joinSchoolDateTime,
  publishableEnrollmentWindows,
  sameEnrollmentWindows,
  splitSchoolDateTime,
} from "@/lib/enrollment-schedule";
import type {
  AcademicTermRef,
  EnrollmentSchedule as EnrollmentScheduleRecord,
  EnrollmentWindow,
  EnrollmentWindowErrors,
} from "@/types/enrollment-management-exports";
import { useEnrollmentManagement } from "./enrollment-management-provider";
import { EnrollmentManagementTabs } from "./enrollment-management-tabs";

/** The term enrollment is usually planned for: the active year's current term, else its next one. */
function defaultTermId(terms: readonly AcademicTermRef[]) {
  const active = terms.filter((item) => item.year.status === "active");
  return (active.find((item) => item.term.status === "current")
    ?? active.find((item) => item.term.status === "upcoming")
    ?? terms[0])?.id ?? "";
}

export function EnrollmentSchedule() {
  const { academicYears, schedules, createSchedule } = useEnrollmentManagement();
  // Only the active academic year is scheduled: drafts stay hidden until activated, and completed years are history.
  const terms = listAcademicTerms(academicYears).filter((item) => item.year.status === "active");
  const [selectedTermId, setSelectedTermId] = useState(() => defaultTermId(terms));
  const termRef = terms.find((item) => item.id === selectedTermId) ?? terms.find((item) => item.id === defaultTermId(terms));
  const schedule = termRef ? schedules.find((item) => item.termId === termRef.id) : undefined;
  // The term menu groups terms under their academic year.
  const termGroups = terms.reduce<{ year: AcademicTermRef["year"]; terms: AcademicTermRef[] }[]>((groups, item) => {
    const group = groups.find((entry) => entry.year.id === item.year.id);
    if (group) group.terms.push(item);
    else groups.push({ year: item.year, terms: [item] });
    return groups;
  }, []);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const focusFirstInput = useRef(false);

  useEffect(() => {
    if (!focusFirstInput.current || !schedule) return;
    focusFirstInput.current = false;
    firstInputRef.current?.focus();
  }, [schedule]);

  return (
    <main className="dean-enrollment-page" aria-labelledby="dean-enrollment-title">
      <header className="dean-enrollment-heading">
        <div>
          <h2 id="dean-enrollment-title">Enrollment management</h2>
          <p>Set when each year level can enroll. The schedule applies to every department.</p>
        </div>
      </header>
      <EnrollmentManagementTabs />

      {terms.length === 0 || !termRef ? (
        <section className="dean-enrollment-card dean-enrollment-empty" aria-labelledby="dean-enrollment-no-terms">
          <CalendarPlus aria-hidden="true" />
          <h3 id="dean-enrollment-no-terms">No active academic year</h3>
          <p>Activate an academic year in Academic years &amp; terms, then come back to set its enrollment windows.</p>
        </section>
      ) : (
        <>
          <div className="dean-enrollment-term-picker">
            <Label htmlFor="dean-enrollment-term">Term</Label>
            <Select value={termRef.id} onValueChange={setSelectedTermId}>
              <SelectTrigger id="dean-enrollment-term" className="dean-enrollment-term-trigger">
                <SelectValue>
                  <span className="dean-enrollment-term-value">
                    <strong>{academicTermLabel(termRef.term.kind)}</strong>
                    <span>· AY {termRef.year.label}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={6} className="dean-enrollment-term-menu">
                {termGroups.map((group, index) => (
                  <Fragment key={group.year.id}>
                    {index > 0 && <SelectSeparator className="dean-enrollment-term-separator" />}
                    <SelectGroup>
                      <SelectLabel className="dean-enrollment-term-group">AY {group.year.label}</SelectLabel>
                      {group.terms.map((item) => (
                        <SelectItem key={item.id} value={item.id} className="dean-enrollment-term-option">
                          {academicTermLabel(item.term.kind)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {schedule ? (
            <ScheduleEditor key={schedule.termId} termRef={termRef} schedule={schedule} firstInputRef={firstInputRef} />
          ) : (
            <section className="dean-enrollment-card" aria-labelledby="dean-enrollment-windows-title">
              <header className="dean-enrollment-card-header">
                <h3 id="dean-enrollment-windows-title">Enrollment windows</h3>
              </header>
              <div className="dean-enrollment-empty">
                <CalendarPlus aria-hidden="true" />
                <h4>No enrollment windows yet</h4>
                <p>No enrollment window has been created for {academicTermRefLabel(termRef)}.</p>
                {termRef.term.status !== "completed" && (
                  <Button
                    type="button"
                    onClick={() => {
                      focusFirstInput.current = true;
                      createSchedule(termRef.id);
                    }}
                  >
                    <Plus aria-hidden="true" />
                    Create enrollment window
                  </Button>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function ScheduleEditor({ termRef, schedule, firstInputRef }: {
  termRef: AcademicTermRef;
  schedule: EnrollmentScheduleRecord;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { now, saveDraft, publishSchedule, setPaused } = useEnrollmentManagement();
  const [windows, setWindows] = useState<readonly EnrollmentWindow[]>(schedule.draft);
  const [errors, setErrors] = useState<EnrollmentWindowErrors>({});
  const [formError, setFormError] = useState("");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const readOnly = termRef.term.status === "completed";
  const published = schedule.published;
  // Blank groups are never published, so compare only the groups that are set.
  const hasUnpublishedChanges = published !== null && !sameEnrollmentWindows(publishableEnrollmentWindows(windows), published);
  const publishedCount = published?.length ?? 0;
  const badge = published === null ? "Draft"
    : hasUnpublishedChanges ? "Unpublished changes"
      : schedule.paused ? "Paused"
        : publishedCount < windows.length ? `Published · ${publishedCount} of ${windows.length} groups` : "Published";
  const badgeState = published === null ? "draft" : hasUnpublishedChanges ? "unpublished-changes" : schedule.paused ? "paused" : "published";
  const errorList = [formError, ...Object.values(errors)].filter(Boolean);

  function update(index: number, field: "opensAt" | "closesAt", part: "date" | "time", value: string) {
    setWindows((current) => current.map((window, position) => {
      if (position !== index) return window;
      const { date, time } = splitSchoolDateTime(window[field]);
      return { ...window, [field]: part === "date" ? joinSchoolDateTime(value, time) : joinSchoolDateTime(date, value) };
    }));
    setErrors((current) => ({ ...current, [windows[index].group]: undefined }));
    setFormError("");
  }

  function publish() {
    const problems = publishSchedule(schedule.termId, windows);
    setErrors(problems?.windows ?? {});
    setFormError(problems?.form ?? "");
    if (problems) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    const count = publishableEnrollmentWindows(windows).length;
    toast.success(count === windows.length
      ? `Enrollment schedule published for ${academicTermRefLabel(termRef)}.`
      : `Published ${count} of ${windows.length} groups for ${academicTermRefLabel(termRef)}. The others stay hidden from their students.`);
  }

  return (
    <>
      <p className="dean-enrollment-banner">
        <CalendarClock aria-hidden="true" />
        <span>
          <strong>Set it once. Enrollment opens automatically.</strong>
          Publish the schedule to open and close enrollment at the times below. No manual activation needed.
        </span>
      </p>

      <section className="dean-enrollment-card" aria-labelledby="dean-enrollment-windows-title">
        <header className="dean-enrollment-card-header">
          <div>
            <h3 id="dean-enrollment-windows-title">Enrollment windows</h3>
            <p>
              Set year-level windows, followed by open enrollment for remaining eligible students. Leave a group blank
              to publish it later.
            </p>
          </div>
          <span className="dean-enrollment-badge" data-state={badgeState}>{badge}</span>
        </header>

        {errorList.length > 0 && (
          <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="dean-enrollment-errors">
            <p>Fix these before publishing:</p>
            <ul>{errorList.map((message) => <li key={message}>{message}</li>)}</ul>
          </div>
        )}

        <Table
          className="dean-enrollment-table"
          containerProps={{ tabIndex: 0, role: "region", "aria-label": `Enrollment windows for ${academicTermRefLabel(termRef)}` }}
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Eligible group</TableHead>
              <TableHead scope="col">Opens on</TableHead>
              <TableHead scope="col">Closes on</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {windows.map((window, index) => {
              const label = enrollmentGroupLabel(window.group);
              const publishedWindow = published?.find((item) => item.group === window.group);
              const status = publishedWindow ? enrollmentWindowStatus(publishedWindow, now, schedule.paused) : null;
              const error = errors[window.group];
              const errorId = `dean-enrollment-${window.group}-error`;
              return (
                <TableRow key={window.group}>
                  <TableHead scope="row">{label}</TableHead>
                  {(["opensAt", "closesAt"] as const).map((field) => {
                    const { date, time } = splitSchoolDateTime(window[field]);
                    const fieldLabel = field === "opensAt" ? "opening" : "closing";
                    return (
                      <TableCell key={field}>
                        <div className="dean-enrollment-datetime">
                          <Input
                            ref={index === 0 && field === "opensAt" ? firstInputRef : undefined}
                            type="date"
                            value={date}
                            disabled={readOnly}
                            aria-label={`${label} ${fieldLabel} date`}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                            onChange={(event) => update(index, field, "date", event.target.value)}
                          />
                          <Input
                            type="time"
                            value={time}
                            disabled={readOnly}
                            aria-label={`${label} ${fieldLabel} time`}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                            onChange={(event) => update(index, field, "time", event.target.value)}
                          />
                        </div>
                        {field === "closesAt" && error && <p id={errorId} className="dean-enrollment-field-error">{error}</p>}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {status
                      ? <span className="dean-enrollment-status" data-status={status}>{enrollmentWindowStatusLabels[status]}</span>
                      : <span className="dean-enrollment-status" data-status="unpublished">Not published</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <p className="dean-enrollment-note">
          <Info aria-hidden="true" />
          Students in a group that isn&apos;t published can&apos;t see or start enrollment, and published groups can
          enroll only while their window is open. Open enrollment includes irregular students and those who missed
          their year-level window; eligibility checks still apply. Times use school time (Asia/Manila).
        </p>
      </section>

      {!readOnly && (
        <div className="dean-enrollment-actions">
          <p>Draft changes are not visible to students.</p>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                saveDraft(schedule.termId, windows);
                toast.success("Draft saved.");
              }}
            >
              Save draft
            </Button>
            <Button type="button" onClick={publish}>Publish schedule</Button>
          </div>
        </div>
      )}

      {!readOnly && (
        <section className="dean-enrollment-card dean-enrollment-pause" aria-labelledby="dean-enrollment-pause-title">
          <div>
            <h3 id="dean-enrollment-pause-title">{schedule.paused ? "Enrollment is paused" : "Need to stop enrollment?"}</h3>
            <p>
              {schedule.paused
                ? "Resume to reopen any window that is still within its scheduled time."
                : "Pause all year levels without changing their scheduled windows."}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={published === null}>
                {schedule.paused ? "Resume enrollment" : "Pause enrollment"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{schedule.paused ? "Resume enrollment?" : "Pause enrollment?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {schedule.paused
                    ? `Students can enroll again during their scheduled windows for ${academicTermRefLabel(termRef)}.`
                    : `Students can't enroll for ${academicTermRefLabel(termRef)} until you resume. The scheduled windows don't change.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setPaused(schedule.termId, !schedule.paused);
                    toast.success(schedule.paused ? "Enrollment resumed." : "Enrollment paused.");
                  }}
                >
                  {schedule.paused ? "Resume enrollment" : "Pause enrollment"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      )}
    </>
  );
}
