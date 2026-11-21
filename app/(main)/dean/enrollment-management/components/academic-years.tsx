"use client";

import { useRef, useState } from "react";
import { CircleCheck, CirclePlay, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  academicTermLabel,
  academicYearCompletionBlocker,
  academicTermStatusLabels,
  academicYearStatusLabels,
  nextUpcomingTerm,
} from "@/lib/academic-calendar";
import type { AcademicCalendarChange, AcademicYear } from "@/types/enrollment-management-exports";
import { AcademicYearDialog } from "./academic-year-dialog";
import { ConfirmYearAction } from "./confirm-year-action";
import { useEnrollmentManagement } from "./enrollment-management-provider";
import { EnrollmentManagementTabs } from "./enrollment-management-tabs";
import { ViewTermsDialog } from "./view-terms-dialog";

export function AcademicYears() {
  const { academicYears, activateAcademicYear, completeAcademicYear, startNextTerm } = useEnrollmentManagement();
  const [dialog, setDialog] = useState<{ open: boolean; year?: AcademicYear }>({ open: false });
  const yearsHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeYear = academicYears.find((year) => year.status === "active");
  const nextTerm = activeYear ? nextUpcomingTerm(activeYear) : null;
  const focusYears = () => yearsHeadingRef.current?.focus();

  function report(change: AcademicCalendarChange, success: string) {
    if (change.error) toast.error(change.error);
    else toast.success(success);
  }

  const completeAction = (year: AcademicYear) => (
    <ConfirmYearAction
      trigger={<><CircleCheck aria-hidden="true" />Mark completed</>}
      label={`Mark ${year.label} completed`}
      title={`Mark ${year.label} completed?`}
      description="Summer and every other term of this academic year become Completed, and the year moves to history. You can then activate the next academic year."
      confirmLabel="Mark completed"
      blockedReason={academicYearCompletionBlocker(year)}
      onConfirm={() => report(completeAcademicYear(year.id), `Academic year ${year.label} completed.`)}
      onDone={focusYears}
    />
  );

  return (
    <main className="dean-enrollment-page" aria-labelledby="dean-academic-years-title">
      <header className="dean-enrollment-heading">
        <div>
          <h2 id="dean-academic-years-title">Academic years &amp; terms</h2>
          <p>Set up the academic calendar before configuring enrollment windows. Terms have no dates.</p>
        </div>
        <Button type="button" onClick={() => setDialog({ open: true })}>
          <Plus aria-hidden="true" />
          Create academic year
        </Button>
      </header>
      <EnrollmentManagementTabs />

      <section className="dean-enrollment-card" aria-labelledby="dean-active-year-title">
        {activeYear ? (
          <>
            <header className="dean-enrollment-card-header">
              <h3 id="dean-active-year-title">AY {activeYear.label}</h3>
              <span className="dean-enrollment-badge" data-state="published">Active academic year</span>
            </header>
            <ol className="dean-enrollment-active-terms">
              {activeYear.terms.map((term) => (
                <li key={term.kind}>
                  <strong>{academicTermLabel(term.kind)}</strong>
                  <span className="dean-enrollment-term-status" data-status={term.status}>{academicTermStatusLabels[term.status]}</span>
                  {nextTerm?.kind === term.kind && (
                    <ConfirmYearAction
                      trigger={<><CirclePlay aria-hidden="true" />Start term</>}
                      label={`Start ${academicTermLabel(term.kind)} of ${activeYear.label}`}
                      title={`Start ${academicTermLabel(term.kind)}?`}
                      description={`${academicTermLabel(term.kind)} becomes the current term of ${activeYear.label}. Any current term is marked completed.`}
                      confirmLabel="Start term"
                      onConfirm={() => report(startNextTerm(activeYear.id), `${academicTermLabel(term.kind)} of ${activeYear.label} started.`)}
                      onDone={focusYears}
                    />
                  )}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="dean-enrollment-empty dean-enrollment-empty-compact">
            <h3 id="dean-active-year-title">No active academic year</h3>
            <p>Activate a draft academic year below to start its terms.</p>
          </div>
        )}
      </section>

      <section className="dean-enrollment-card" aria-labelledby="dean-all-years-title">
        <header className="dean-enrollment-card-header">
          <h3 id="dean-all-years-title" ref={yearsHeadingRef} tabIndex={-1}>All academic years</h3>
        </header>
        <Table className="dean-enrollment-table" containerProps={{ tabIndex: 0, role: "region", "aria-label": "All academic years" }}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Academic year</TableHead>
              <TableHead scope="col">Terms</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="dean-enrollment-actions-head">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicYears.map((year) => (
              <TableRow key={year.id}>
                <TableHead scope="row">{year.label}</TableHead>
                <TableCell>{year.terms.length} terms</TableCell>
                <TableCell>{academicYearStatusLabels[year.status]}</TableCell>
                <TableCell>
                  <div className="dean-enrollment-row-actions">
                    {year.status === "draft" && (
                      <ConfirmYearAction
                        trigger={<><CircleCheck aria-hidden="true" />Activate year</>}
                        label={`Activate ${year.label}`}
                        title={`Activate ${year.label}?`}
                        description={`${year.label} becomes the active academic year. Start its first term when classes begin.`}
                        confirmLabel="Activate year"
                        blockedReason={activeYear ? `Mark ${activeYear.label} completed before activating ${year.label}. Only one academic year can be active.` : null}
                        onConfirm={() => report(activateAcademicYear(year.id), `Academic year ${year.label} activated.`)}
                        onDone={focusYears}
                      />
                    )}
                    {year.status === "active" && completeAction(year)}
                    {year.status !== "draft" ? (
                      <ViewTermsDialog year={year} />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="dean-enrollment-row-action"
                        aria-label={`Edit ${year.label}`}
                        onClick={() => setDialog({ open: true, year })}
                      >
                        <Pencil aria-hidden="true" />
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {academicYears.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No academic years yet. Create one to start planning enrollment.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
      <p className="dean-enrollment-footnote">Only the Dean can create, activate, or complete academic years.</p>

      <AcademicYearDialog
        open={dialog.open}
        year={dialog.year}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </main>
  );
}

