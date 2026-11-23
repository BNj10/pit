"use client";

import { useState } from "react";
import { CalendarX2, ClipboardCheck, Search, SearchX, UsersRound, X } from "lucide-react";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { InstructorEvaluationAction } from "@/components/shared/faculty-evaluation/instructor-evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evaluationTermKey, instructorInitials } from "@/lib/faculty-evaluation";
import type {
  DepartmentChairEvaluationProps,
  DepartmentChairEvaluationStatusFilter,
} from "@/types/faculty-evaluation-types";
import { EvaluationStatusFilter } from "./evaluation-status-filter";
import { InstructorEvaluationNotice } from "./instructor-evaluation-notice";

export function InstructorEvaluationList({ department }: DepartmentChairEvaluationProps) {
  const { data, window, status, submissions } = useEvaluation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DepartmentChairEvaluationStatusFilter>("all");
  const term = window ? evaluationTermKey(window) : null;
  const departmentInstructors = data.instructors.filter((instructor) => instructor.department === department);
  const chairSubmissions = new Map(
    submissions
      .filter((submission) => submission.term === term && submission.audience === "department-chair")
      .map((submission) => [submission.instructorId, submission]),
  );
  const search = query.trim().toLocaleLowerCase();
  const instructors = departmentInstructors.filter((instructor) =>
    (!search || instructor.name.toLocaleLowerCase().includes(search)) &&
    (statusFilter === "all" || (statusFilter === "evaluated") === chairSubmissions.has(instructor.id)),
  );

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  function renderContent() {
    if (status === null) {
      return <p className="chair-evaluation-loading" role="status">Loading instructors…</p>;
    }
    if (status !== "Open") {
      return (
        <InstructorEvaluationNotice
          icon={CalendarX2}
          title="Instructor evaluation isn’t available right now"
          description="You can evaluate instructors in your department once instructor evaluation becomes available."
        />
      );
    }
    if (departmentInstructors.length === 0) {
      return (
        <InstructorEvaluationNotice
          icon={UsersRound}
          title="No instructors to evaluate"
          description="No instructors are assigned to your department this term."
        />
      );
    }

    return (
      <>
        <div className="instructor-records-filters" role="search" aria-label="Filter instructors">
          <div className="instructor-faculty-search">
            <Search aria-hidden="true" />
            <label htmlFor="chair-instructor-search" className="sr-only">Search instructors by name</label>
            <Input
              id="chair-instructor-search"
              type="search"
              value={query}
              placeholder="Search instructors by name..."
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" aria-label="Clear instructor search" onClick={() => setQuery("")}>
                <X aria-hidden="true" />
              </button>
            )}
          </div>
          <EvaluationStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <section className="instructor-records-panel" aria-label={`${department} instructors`}>
          <Table
            className="instructor-records-table chair-evaluation-table"
            containerProps={{
              tabIndex: 0,
              role: "region",
              "aria-label": "Instructors available for evaluation",
            }}
          >
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Instructor</TableHead>
                <TableHead scope="col">Department</TableHead>
                <TableHead scope="col">Academic rank</TableHead>
                <TableHead scope="col" className="instructor-records-action">Evaluation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="instructor-faculty-identity">
                      <span className="instructor-faculty-avatar" aria-hidden="true">{instructorInitials(instructor.name)}</span>
                      <span>{instructor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="instructor-faculty-department">{instructor.department}</TableCell>
                  <TableCell>{instructor.rank}</TableCell>
                  <TableCell className="instructor-records-action">
                    <InstructorEvaluationAction
                      instructor={instructor}
                      audience="department-chair"
                      submission={chairSubmissions.get(instructor.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {instructors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="instructor-records-empty">
                      <SearchX aria-hidden="true" />
                      <h3>No instructors match</h3>
                      <p>Try another name or evaluation status.</p>
                      <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <footer className="instructor-records-footer">
            <p>
              <ClipboardCheck aria-hidden="true" />
              Evaluate the instructor’s overall handling of assigned subjects, not each subject separately.
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {`${instructors.length} of ${departmentInstructors.length} instructors shown.`}
            </p>
          </footer>
        </section>
      </>
    );
  }

  return (
    <main className="faculty-evaluation-page instructor-records-page chair-evaluation-page" aria-labelledby="chair-evaluation-title">
      <div className="faculty-evaluation-page-heading instructor-records-heading">
        <div>
          <h2 id="chair-evaluation-title">Instructor Evaluation</h2>
          <p>Evaluate each instructor’s overall teaching performance across assigned subjects in {department}.</p>
        </div>
      </div>
      {renderContent()}
    </main>
  );
}
