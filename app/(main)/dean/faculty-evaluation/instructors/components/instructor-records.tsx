"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ClipboardCheck, Search, SearchX, X } from "lucide-react";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { InstructorEvaluationAction } from "@/components/shared/faculty-evaluation/instructor-evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evaluationTermKey, formatEvaluationDate } from "@/lib/faculty-evaluation";
import type { EvaluationTermResult } from "@/types/faculty-evaluation-types";
import { InstructorResultAction } from "../../historical-term-results/components/instructor-result-action";
import { DepartmentFilter } from "./department-filter";
// Separate from the import above so it merges cleanly with the dean branch, which edits that line.
import { instructorInitials } from "@/lib/faculty-evaluation";

export function InstructorRecords({ historicalTerm }: { historicalTerm?: EvaluationTermResult }) {
  const { data, window, status, submissions } = useEvaluation();
  const [department, setDepartment] = useState("Electrical Engineering");
  const [query, setQuery] = useState("");
  const term = window ? evaluationTermKey(window) : null;
  const availableInstructors = historicalTerm
    ? (historicalTerm.instructorResults ?? []).map((result) => result.instructor)
    : data.instructors;
  const historicalResults = new Map(
    historicalTerm?.instructorResults?.map((result) => [result.instructor.id, result]),
  );
  const departments = [...new Set([...data.departments, ...availableInstructors.map((instructor) => instructor.department)])];
  const search = query.trim().toLocaleLowerCase();
  const instructors = availableInstructors.filter((instructor) =>
    (department === "all" || instructor.department === department) &&
    (!search || `${instructor.name} ${instructor.department} ${instructor.rank}`.toLocaleLowerCase().includes(search)),
  );
  const termSubmissions = new Map(
    submissions
      .filter((submission) => submission.term === term && submission.audience === "dean")
      .map((submission) => [submission.instructorId, submission]),
  );
  const departmentLabel = department === "all" ? "All departments" : department;

  return (
    <main
      className={`faculty-evaluation-page instructor-records-page${historicalTerm ? " historical-term-results-page" : ""}`}
      aria-labelledby="instructor-records-title"
    >
      <div className="faculty-evaluation-page-heading instructor-records-heading">
        <div>
          <h2 id="instructor-records-title">
            {historicalTerm
              ? "Faculty evaluation results"
              : department === "all" ? "Faculty evaluation" : `${department} Department`}
          </h2>
          <p>
            {historicalTerm
              ? "Review instructor results for the selected historical term. Results are read-only."
              : `${department === "all" ? "Evaluate faculty" : `Evaluate ${department} faculty`} or review their submitted performance results.`}
          </p>
        </div>
        <Button asChild variant="outline" className="instructor-window-link">
          <Link href={historicalTerm ? "/dean/faculty-evaluation#evaluation-history-title" : "/dean/faculty-evaluation"}>
            <ArrowLeft aria-hidden="true" />
            {historicalTerm ? "Back to term history" : "Window configuration"}
          </Link>
        </Button>
      </div>

      <div className="instructor-window-banner" data-status={historicalTerm ? "Historical" : status}>
        <div>
          <CalendarDays aria-hidden="true" />
          <p>
            {historicalTerm ? (
              <>
                <span>{historicalTerm.semester === "first" ? "1st" : "2nd"} semester · Academic year {historicalTerm.academicYear}</span>
                <span className="instructor-window-divider" aria-hidden="true">|</span>
                <span>Historical evaluation results</span>
              </>
            ) : window ? (
              <>
                <span>{window.semester === "first" ? "1st" : "2nd"} semester · {window.academicYear}</span>
                <span className="instructor-window-divider" aria-hidden="true">|</span>
                <span>{formatEvaluationDate(window.opensAt)} – {formatEvaluationDate(window.closesAt)} · Asia/Manila</span>
              </>
            ) : (
              <span>No evaluation window has been created yet</span>
            )}
          </p>
        </div>
        <span
          className="instructor-window-status"
          role="status"
          aria-label={historicalTerm ? "Historical evaluation results" : `Evaluation window: ${status ?? "Checking availability"}`}
        >
          {historicalTerm ? "Historical" : status ?? "Checking…"}
        </span>
      </div>

      <div className="instructor-records-filters" role="search" aria-label="Filter instructor records">
        <div className="instructor-faculty-search">
          <Search aria-hidden="true" />
          <label htmlFor="instructor-faculty-search" className="sr-only">Search faculty by name, department, or rank</label>
          <Input
            id="instructor-faculty-search"
            type="search"
            value={query}
            placeholder={department === "all" ? "Search faculty…" : `Search ${department} faculty…`}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" aria-label="Clear faculty search" onClick={() => setQuery("")}>
              <X aria-hidden="true" />
            </button>
          )}
        </div>
        <DepartmentFilter
          departments={departments}
          value={department}
          onChange={setDepartment}
          note={historicalTerm ? "Filters instructor results in the selected historical term." : undefined}
        />
      </div>

      {!historicalTerm && status !== null && status !== "Open" && (
        <p className="instructor-window-help" role="status">
          {!window
            ? "No evaluation window has been created yet. Create one in Evaluation management to accept ratings."
            : status === "Scheduled"
            ? "Evaluations will be available when the window opens. Submitted evaluations can still be viewed."
            : "This evaluation window is closed. View submitted evaluations or update the window configuration to accept ratings."}
        </p>
      )}

      <section className="instructor-records-panel" aria-label={`${departmentLabel} instructor records`}>
        <Table
          className={`instructor-records-table${instructors.length === 0 ? " instructor-records-table-empty" : ""}`}
          containerProps={{
            tabIndex: 0,
            role: "region",
            "aria-label": historicalTerm
              ? "Faculty evaluation results for the selected historical term"
              : "Faculty members available for dean evaluation",
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Faculty member</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col">Department ranking</TableHead>
              <TableHead scope="col" className="instructor-records-action">
                {historicalTerm ? "Evaluation" : <span className="sr-only">Evaluation action</span>}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((instructor) => {
              const submission = termSubmissions.get(instructor.id);
              const historicalResult = historicalResults.get(instructor.id);
              return (
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
                    {historicalTerm ? (
                      historicalResult && <InstructorResultAction result={historicalResult} term={historicalTerm} />
                    ) : (
                      <InstructorEvaluationAction instructor={instructor} audience="dean" submission={submission} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {instructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="instructor-records-empty">
                    <SearchX aria-hidden="true" />
                    <h3>No instructors found</h3>
                    <p>
                      {search
                        ? "Try another name, department, or rank."
                        : historicalTerm
                          ? `No instructor results are available for ${departmentLabel} in this historical term.`
                          : `No instructors are assigned to ${departmentLabel} in this evaluation window.`}
                    </p>
                    <Button variant="outline" onClick={() => { setQuery(""); setDepartment("all"); }}>Clear filters</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <footer className="instructor-records-footer">
          <p>
            <ClipboardCheck aria-hidden="true" />
            {historicalTerm
              ? "Read-only results · Select an instructor to review their evaluation summary."
              : "Rate each assigned faculty member once. Submitted evaluations are locked for reporting integrity."}
          </p>
          {historicalTerm && (
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {`${instructors.length} instructor results shown.`}
            </p>
          )}
        </footer>
      </section>
    </main>
  );
}
