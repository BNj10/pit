"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  compareEnrollments,
  enrollmentStatuses,
  enrollmentTermLabel,
  enrollmentYearLevels,
  manilaTimestampNow,
  termsWithEnrollments,
} from "@/lib/enrollment-review";
import type {
  EnrollmentManagementProps,
  EnrollmentStatus,
  EnrollmentYearLevel,
  StudentEnrollment,
} from "@/types/enrollment-review-exports";
import { EnrollmentReviewDialog } from "./enrollment-review-dialog";
import { EnrollmentRoster } from "./enrollment-roster";

const pageSize = 10;

type StatusFilter = "all" | EnrollmentStatus;
type YearFilter = "all" | EnrollmentYearLevel;

// Preview workflow: decisions stay in this browser session until enrollment is saved through the server.
export function EnrollmentManagement({ data }: EnrollmentManagementProps) {
  const terms = termsWithEnrollments(data.terms, data.enrollments);
  const [enrollments, setEnrollments] = useState<readonly StudentEnrollment[]>(data.enrollments);
  const [termId, setTermId] = useState(terms[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const term = terms.find((item) => item.id === termId);
  const termLabel = term ? enrollmentTermLabel(term) : "";
  const termEnrollments = enrollments.filter((enrollment) => enrollment.termId === termId);
  const submissions = termEnrollments.filter((enrollment) => enrollment.status !== "not-submitted").length;
  const search = query.trim().toLocaleLowerCase();
  const filtered = termEnrollments
    .filter((enrollment) =>
      (!search || `${enrollment.student.name} ${enrollment.student.studentNumber}`.toLocaleLowerCase().includes(search)) &&
      (statusFilter === "all" || enrollment.status === statusFilter) &&
      (yearFilter === "all" || enrollment.student.yearLevel === yearFilter),
    )
    .sort(compareEnrollments);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastShown = Math.min(currentPage * pageSize, filtered.length);
  const openEnrollment = enrollments.find((enrollment) => enrollment.id === openId);
  const filtersActive = Boolean(search) || statusFilter !== "all" || yearFilter !== "all";

  function updateFilters(update: () => void) {
    update();
    setPage(1);
  }

  function clearFilters() {
    updateFilters(() => {
      setQuery("");
      setStatusFilter("all");
      setYearFilter("all");
    });
  }

  function decide(enrollment: StudentEnrollment, patch: Partial<StudentEnrollment>, message: string) {
    setEnrollments((current) => current.map((item) => item.id === enrollment.id ? { ...item, ...patch } : item));
    setOpenId(null);
    toast.success(message);
  }

  return (
    <main className="enrollment-page" aria-labelledby="enrollment-title">
      <header className="enrollment-heading">
        <h2 id="enrollment-title">Manage Enrollment</h2>
        <p>Track every student’s enrollment progress and review submitted subject lists.</p>
      </header>

      <div className="enrollment-filters" role="search" aria-label="Filter the department roster">
        <div className="enrollment-search">
          <Search aria-hidden="true" />
          <label htmlFor="enrollment-search" className="sr-only">Search student name or ID</label>
          <Input
            id="enrollment-search"
            type="search"
            value={query}
            placeholder="Search student name or ID"
            autoComplete="off"
            onChange={(event) => updateFilters(() => setQuery(event.target.value))}
          />
          {query && (
            <button type="button" aria-label="Clear student search" onClick={() => updateFilters(() => setQuery(""))}>
              <X aria-hidden="true" />
            </button>
          )}
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            const option = enrollmentStatuses.find((item) => item.value === value);
            updateFilters(() => setStatusFilter(option ? option.value : "all"));
          }}
        >
          <SelectTrigger className="enrollment-filter-trigger" aria-label="Filter by status">
            <SelectValue>
              Status: {statusFilter === "all" ? "All statuses" : enrollmentStatuses.find((item) => item.value === statusFilter)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={6} className="enrollment-filter-menu">
            <SelectItem value="all" className="enrollment-filter-option">All statuses</SelectItem>
            {enrollmentStatuses.map((option) => (
              <SelectItem key={option.value} value={option.value} className="enrollment-filter-option">{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(yearFilter)}
          onValueChange={(value) => {
            const option = enrollmentYearLevels.find((item) => String(item.value) === value);
            updateFilters(() => setYearFilter(option ? option.value : "all"));
          }}
        >
          <SelectTrigger className="enrollment-filter-trigger" aria-label="Filter by year level">
            <SelectValue>
              Year: {yearFilter === "all" ? "All year levels" : enrollmentYearLevels.find((item) => item.value === yearFilter)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={6} className="enrollment-filter-menu">
            <SelectItem value="all" className="enrollment-filter-option">All year levels</SelectItem>
            {enrollmentYearLevels.map((option) => (
              <SelectItem key={option.value} value={String(option.value)} className="enrollment-filter-option">{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={termId}
          onValueChange={(value) => {
            if (terms.some((item) => item.id === value)) updateFilters(() => setTermId(value));
          }}
        >
          <SelectTrigger className="enrollment-filter-trigger enrollment-term-trigger" aria-label="Academic term">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={6} className="enrollment-filter-menu">
            {terms.map((item, index) => (
              <SelectItem key={item.id} value={item.id} className="enrollment-filter-option">
                {enrollmentTermLabel(item)}{index === 0 ? " (latest)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="enrollment-panel" aria-labelledby="enrollment-roster-title">
        <header className="enrollment-panel-header">
          <div>
            <h3 id="enrollment-roster-title">Department roster</h3>
            <p>{data.department} · {termLabel}</p>
          </div>
          <p className="enrollment-submissions">Submissions: {submissions}</p>
        </header>

        {terms.length === 0 ? (
          <div className="enrollment-empty" role="status">
            <SearchX aria-hidden="true" />
            <h4>No enrollment records yet</h4>
            <p>Students’ submissions will appear here once an enrollment period opens.</p>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="enrollment-empty" role="status">
            <SearchX aria-hidden="true" />
            <h4>No students match</h4>
            <p>Try another name, student number, status, or year level.</p>
            {filtersActive && <Button type="button" variant="outline" onClick={clearFilters}>Clear filters</Button>}
          </div>
        ) : (
          <EnrollmentRoster enrollments={pageRows} onOpen={(enrollment) => setOpenId(enrollment.id)} />
        )}

        <footer className="enrollment-pagination">
          <p role="status" aria-live="polite">
            Showing {firstShown}–{lastShown} of {filtered.length} {filtered.length === 1 ? "student" : "students"}
          </p>
          <nav aria-label="Roster pages">
            <span>Page {currentPage} of {pageCount}</span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={currentPage >= pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </nav>
        </footer>
      </section>

      {openEnrollment && (
        <EnrollmentReviewDialog
          key={`${openEnrollment.id}-${openEnrollment.status}`}
          enrollment={openEnrollment}
          onClose={() => setOpenId(null)}
          onApprove={() => decide(openEnrollment, { status: "approved" }, `${openEnrollment.student.name}'s enrollment approved.`)}
          onReturn={(message) => decide(
            openEnrollment,
            { status: "returned", lastReturn: { message, returnedAt: manilaTimestampNow() } },
            `Enrollment returned to ${openEnrollment.student.name}.`,
          )}
          onMarkEnrolled={() => decide(openEnrollment, { status: "enrolled" }, `${openEnrollment.student.name} marked as enrolled.`)}
        />
      )}
    </main>
  );
}
