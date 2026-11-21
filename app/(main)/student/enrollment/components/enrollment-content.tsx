"use client";

import { useRef, useState, type MouseEvent } from "react";
import { BookOpen, CalendarRange, ChevronLeft, ChevronRight, Info, Plus, Search, X } from "lucide-react";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  describeEnrollmentSlots, findEnrollmentScheduleConflict, formatEnrollmentSchedule, formatEnrollmentSlots,
  getEnrollmentSubmissionIssue, getEnrollmentTotalUnits, isEnrollmentOfferingAvailable,
} from "@/lib/enrollment";
import type { EnrollmentData, EnrollmentDialogIssue, EnrollmentOffering } from "@/types/enrollment-types";
import { EnrollmentSubmitted } from "./enrollment-submitted";
import { EnrollmentValidationDialog } from "./enrollment-validation-dialog";

const OFFERINGS_PER_PAGE = 8;

// The search box matches only the field chosen here.
const SEARCH_FIELDS = [
  {
    value: "all", label: "All fields", placeholder: "Search by code, name, department or section",
    text: (offering: EnrollmentOffering) => `${offering.code} ${offering.title} ${offering.department} ${offering.section}`,
  },
  { value: "code", label: "Code", placeholder: "Search by subject code", text: (offering: EnrollmentOffering) => offering.code },
  { value: "title", label: "Subject name", placeholder: "Search by subject name", text: (offering: EnrollmentOffering) => offering.title },
  { value: "department", label: "Department", placeholder: "Search by department", text: (offering: EnrollmentOffering) => offering.department },
  { value: "section", label: "Section", placeholder: "Search by section", text: (offering: EnrollmentOffering) => offering.section },
] as const;
const [ALL_FIELDS, ...SINGLE_FIELDS] = SEARCH_FIELDS;
const SEARCH_FIELD_ITEM_CLASS = "py-2 pr-8 pl-2.5 text-xs data-[state=checked]:font-semibold";

type SearchField = (typeof SEARCH_FIELDS)[number]["value"];

export function EnrollmentContent({
  term, unitLimit, offerings, initialEnrollmentIds, initialSelectedIds, requirementIssues, fullOnSubmitIds,
}: EnrollmentData) {
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [page, setPage] = useState(1);
  const [enrollmentIds, setEnrollmentIds] = useState<readonly string[]>(initialEnrollmentIds);
  const enrollment = enrollmentIds.flatMap((id) => {
    const offering = offerings.find((item) => item.id === id);
    return offering ? [offering] : [];
  });
  const enrolledSubjectCodes = new Set(enrollment.map((offering) => offering.code));
  const [selectedIds, setSelectedIds] = useState<readonly string[]>(() => initialSelectedIds.filter((id) => {
    const offering = offerings.find((item) => item.id === id);
    return offering && !enrolledSubjectCodes.has(offering.code) && isEnrollmentOfferingAvailable(offering);
  }));
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationIssue, setValidationIssue] = useState<EnrollmentDialogIssue | null>(null);
  const validationFocusRef = useRef<(() => void) | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const offeringsRef = useRef<HTMLDivElement>(null);
  const summaryTitleRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const activeSearchField = SEARCH_FIELDS.find((field) => field.value === searchField) ?? ALL_FIELDS;
  const filteredOfferings = offerings.filter((offering) => activeSearchField.text(offering).toLocaleLowerCase().includes(query));
  const pageCount = Math.max(1, Math.ceil(filteredOfferings.length / OFFERINGS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * OFFERINGS_PER_PAGE;
  const visibleOfferings = filteredOfferings.slice(pageStart, pageStart + OFFERINGS_PER_PAGE);
  const totalUnits = getEnrollmentTotalUnits(enrollment);
  const remainingUnits = Math.max(0, unitLimit - totalUnits);
  const additions: EnrollmentOffering[] = [];
  const subjectCodes = new Set(enrolledSubjectCodes);
  for (const offering of offerings) {
    if (selectedIds.includes(offering.id) && !subjectCodes.has(offering.code)) {
      additions.push(offering);
      subjectCodes.add(offering.code);
    }
  }
  const nextEnrollment = [...enrollment, ...additions];
  const proposedUnits = getEnrollmentTotalUnits(nextEnrollment);
  const exceedsUnitLimit = proposedUnits > unitLimit;
  const additionLimitMessage = additions.length > 0 && exceedsUnitLimit
    ? `Adding these subjects would bring your load to ${proposedUnits} units, above the ${unitLimit}-unit limit. Remove subjects from your summary or change your selection.`
    : "";
  const feedback = additionLimitMessage || message;

  function changePage(nextPage: number) {
    if (nextPage === currentPage) return;
    setPage(nextPage);
    // Bring the new results into view and keep keyboard focus out of disabled controls.
    requestAnimationFrame(() => {
      const container = offeringsRef.current;
      const firstAvailable = container?.querySelector<HTMLButtonElement>("button:not(:disabled)");
      (firstAvailable ?? container)?.focus();
    });
  }

  function toggleOffering(offering: EnrollmentOffering) {
    if (enrolledSubjectCodes.has(offering.code) || !isEnrollmentOfferingAvailable(offering)) return;
    const id = offering.id;
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setMessage("");
  }

  function showValidationIssue(issue: EnrollmentDialogIssue, trigger: HTMLButtonElement) {
    validationFocusRef.current = () => { if (trigger.isConnected) trigger.focus(); };
    setValidationIssue(issue);
  }

  function reviewValidationIssue() {
    if (!validationIssue) return;
    if (validationIssue.type === "schedule-conflict") {
      const id = validationIssue.selected.id;
      setSearch("");
      setSearchField("all");
      setPage(Math.floor(Math.max(0, offerings.findIndex((offering) => offering.id === id)) / OFFERINGS_PER_PAGE) + 1);
      validationFocusRef.current = () => (document.getElementById(`enrollment-offering-${id}`) ?? searchRef.current)?.focus();
    } else {
      const id = validationIssue.type === "requirements" ? validationIssue.requirements[0]?.offeringId : validationIssue.offerings[0]?.id;
      validationFocusRef.current = () => (document.getElementById(`enrollment-remove-${id}`) ?? summaryTitleRef.current)?.focus();
    }
    setValidationIssue(null);
  }

  function addSelectedSubjects(event: MouseEvent<HTMLButtonElement>) {
    const added = additions.length;
    if (added === 0) {
      setMessage("The selected subjects are already in your enrollment summary.");
      return;
    }
    if (exceedsUnitLimit) {
      setMessage(additionLimitMessage);
      return;
    }
    for (let index = 0; index < additions.length; index++) {
      const conflict = findEnrollmentScheduleConflict([additions[index]], nextEnrollment.slice(0, enrollment.length + index));
      if (conflict) {
        showValidationIssue(conflict, event.currentTarget);
        return;
      }
    }
    setEnrollmentIds(nextEnrollment.map((offering) => offering.id));
    setSelectedIds([]);
    setMessage(`Added ${added} ${added === 1 ? "subject" : "subjects"} to your enrollment summary.`);
  }

  function removeSubject(offering: EnrollmentOffering) {
    setEnrollmentIds((current) => current.filter((id) => id !== offering.id));
    setMessage(`Removed ${offering.code} from your enrollment summary.`);
    summaryTitleRef.current?.focus({ preventScroll: true });
  }

  function submitEnrollment(event: MouseEvent<HTMLButtonElement>) {
    if (enrollment.length === 0) return;
    const issue = getEnrollmentSubmissionIssue(enrollment, unitLimit, requirementIssues, fullOnSubmitIds);
    if (issue) {
      if (issue.type === "unit-limit") {
        setMessage(`Your load is ${issue.totalUnits} units, above the ${issue.unitLimit}-unit limit. Remove subjects from your summary before submitting.`);
        requestAnimationFrame(() => feedbackRef.current?.focus());
      } else {
        showValidationIssue(issue, event.currentTarget);
      }
      return;
    }
    // Demo-only transition; connect the enrollment service before persisting a submission.
    setSubmitted(true);
    requestAnimationFrame(() => document.getElementById("enrollment-submitted-title")?.focus());
  }

  if (submitted) return <EnrollmentSubmitted />;

  return (
    <section data-page="enrollment" className="flex min-w-0 flex-col gap-3.5" aria-labelledby="enrollment-title">
      <header className="flex min-h-[60px] flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="enrollment-title" className="text-[25px] font-bold leading-tight">Choose subjects to enroll</h2>
          <p className="mt-[5px] text-xs leading-[1.4] text-muted-foreground">Search available offerings, choose your sections, and review your proposed load before submitting.</p>
        </div>
        <p className="flex shrink-0 items-center gap-2 rounded-md border border-border px-[11px] py-2 text-xs leading-[1.4] font-bold">
          <CalendarRange className="size-3.5 text-primary" aria-hidden="true" />{term}
        </p>
      </header>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-background" aria-labelledby="enrollment-offerings-title">
          <h3 id="enrollment-offerings-title" className="sr-only">Available subject offerings</h3>
          <div className="flex flex-col gap-1.5 px-5 py-4">
            <label htmlFor="enrollment-search" className="text-xs font-medium text-muted-foreground">Search subjects</label>
            <div className="flex h-10 w-full min-w-0 rounded-md border border-border bg-background sm:h-9 sm:max-w-120">
              <Select value={searchField} onValueChange={(value) => {
                const field = SEARCH_FIELDS.find((item) => item.value === value);
                if (!field) return;
                setSearchField(field.value);
                setPage(1);
              }}>
                <SelectTrigger
                  aria-label="Search in"
                  className="shrink-0 gap-1.5 rounded-l-md rounded-r-none border-0 border-r border-border bg-muted px-3 text-xs font-semibold data-[size=default]:h-full sm:w-32 [&>svg]:size-3.5 [&>svg]:text-foreground [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="min-w-44 rounded-lg p-1">
                  <SelectGroup>
                    <SelectLabel className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Search in</SelectLabel>
                    <SelectItem value={ALL_FIELDS.value} className={SEARCH_FIELD_ITEM_CLASS}>{ALL_FIELDS.label}</SelectItem>
                  </SelectGroup>
                  <SelectSeparator className="mx-2" />
                  <SelectGroup>
                    {SINGLE_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value} className={SEARCH_FIELD_ITEM_CLASS}>{field.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="relative flex min-w-0 flex-1 items-center">
                <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" aria-hidden="true" />
                <Input
                  ref={searchRef}
                  id="enrollment-search"
                  type="search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  placeholder={activeSearchField.placeholder}
                  className="h-full rounded-l-none rounded-r-md border-0 pr-3 pl-8.5 text-base sm:text-xs md:text-xs"
                />
              </div>
            </div>
          </div>
          <Table
            id="enrollment-offerings-table"
            className="min-w-206.5 table-fixed"
            aria-labelledby="enrollment-offerings-title"
            containerProps={{ ref: offeringsRef, role: "region", "aria-label": "Available offerings; scroll horizontally to view all columns", tabIndex: 0, className: "table-scroll focus-visible:-outline-offset-2" }}
          >
            <colgroup>
              <col /><col className="w-[84px]" /><col className="w-21" /><col className="w-[140px]" />
              <col className="w-[84px]" /><col className="w-16" /><col className="w-[60px]" />
            </colgroup>
            <TableHeader className="bg-muted">
              <TableRow className="h-14 hover:bg-transparent [&_th]:h-14 [&_th]:px-1.5 [&_th]:text-xs [&_th]:leading-[1.4] [&_th]:font-semibold [&_th]:text-muted-foreground">
                <TableHead scope="col" className="pl-5!">Code / Subject title</TableHead>
                <TableHead scope="col">Section</TableHead>
                <TableHead scope="col">Slots</TableHead>
                <TableHead scope="col">Schedule</TableHead><TableHead scope="col">Room(s)</TableHead>
                <TableHead scope="col">Lec/Lab</TableHead><TableHead scope="col" className="pr-5!">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOfferings.map((offering) => {
                const alreadyAdded = enrolledSubjectCodes.has(offering.code);
                const unavailable = !alreadyAdded && !isEnrollmentOfferingAvailable(offering);
                const disabled = alreadyAdded || unavailable;
                const selected = !disabled && selectedIds.includes(offering.id);
                const status = alreadyAdded ? "Already added" : !unavailable ? "Select" : offering.slots.status === "reserved" ? "Reserved" : "Full";
                return (
                  <TableRow
                    key={offering.id}
                    data-selected={selected || undefined}
                    data-disabled={disabled || undefined}
                    aria-disabled={disabled || undefined}
                    className="h-[104px] cursor-pointer [&_td]:px-1.5 [&_td]:py-4 [&_td]:text-xs [&_td]:leading-[1.55] data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary hover:bg-surface-hover data-disabled:cursor-not-allowed data-disabled:bg-border/50 data-disabled:text-muted-foreground data-disabled:hover:bg-border/50 data-disabled:[&_td]:opacity-60"
                    onClick={(event) => {
                      if (!(event.target instanceof Element) || !event.target.closest("button")) toggleOffering(offering);
                    }}
                  >
                    <TableHead scope="row" className="py-4 pr-1.5 pl-5 text-xs text-inherit">
                      <button
                        id={`enrollment-offering-${offering.id}`}
                        type="button"
                        disabled={disabled}
                        aria-label={`${status} ${offering.code}, ${offering.title}, ${offering.section}`}
                        aria-pressed={selected}
                        onClick={() => toggleOffering(offering)}
                        className="flex min-h-11 w-full cursor-pointer flex-col gap-2 rounded-sm text-left leading-[1.55] font-normal whitespace-normal outline-offset-4 focus-visible:outline-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:text-muted-foreground/60"
                      >
                        <span className="font-semibold">{offering.code}</span>
                        <span>{offering.title}</span>
                      </button>
                    </TableHead>
                    <TableCell>{offering.section}</TableCell>
                    <TableCell className="whitespace-pre-line">
                      <span aria-hidden="true">{formatEnrollmentSlots(offering.slots)}</span>
                      <span className="sr-only">{describeEnrollmentSlots(offering.slots)}</span>
                    </TableCell>
                    <TableCell className="whitespace-pre-line">{formatEnrollmentSchedule(offering.meetings)}</TableCell>
                    <TableCell className="whitespace-pre-line">{offering.rooms}</TableCell>
                    <TableCell>{offering.lectureUnits.toFixed(1)}/{offering.labUnits.toFixed(1)}</TableCell>
                    <TableCell className="pr-5!">{(offering.lectureUnits + offering.labUnits).toFixed(1)}</TableCell>
                  </TableRow>
                );
              })}
              {filteredOfferings.length === 0 && (
                <TableRow className="hover:bg-transparent"><TableCell colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">No subjects match your search.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-xs leading-[1.4] text-muted-foreground">
              Showing {filteredOfferings.length === 0 ? 0 : pageStart + 1}–{pageStart + visibleOfferings.length} of {filteredOfferings.length} {filteredOfferings.length === 1 ? "subject" : "subjects"}
            </p>
            <Pagination aria-label="Subject offerings pagination" className="mx-0! w-auto! max-w-full">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <Button type="button" variant="outline" aria-label="Previous page" aria-controls="enrollment-offerings-table" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} className="h-10 gap-1.5 rounded-md px-3 text-xs max-sm:size-11 max-sm:px-0">
                    <ChevronLeft aria-hidden="true" /><span className="hidden sm:inline">Previous</span>
                  </Button>
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <Button type="button" variant={pageNumber === currentPage ? "default" : "outline"} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === currentPage ? "page" : undefined} aria-controls="enrollment-offerings-table" onClick={() => changePage(pageNumber)} className="h-10 w-10 rounded-md text-xs max-sm:size-11">
                        {pageNumber}
                      </Button>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <Button type="button" variant="outline" aria-label="Next page" aria-controls="enrollment-offerings-table" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)} className="h-10 gap-1.5 rounded-md px-3 text-xs max-sm:size-11 max-sm:px-0">
                    <span className="hidden sm:inline">Next</span><ChevronRight aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          <div ref={feedbackRef} id="enrollment-add-feedback" role="status" aria-atomic="true" tabIndex={-1} className="text-xs text-primary">
            {feedback && <p className="flex items-start gap-2 bg-primary-soft px-5 py-3"><Info className="size-4 shrink-0" aria-hidden="true" />{feedback}</p>}
          </div>
          <footer className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
            <p className="text-xs leading-[1.4] text-muted-foreground">{remainingUnits} {remainingUnits === 1 ? "unit" : "units"} available</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-xs leading-[1.4] font-bold text-primary" aria-live="polite">{selectedIds.length} {selectedIds.length === 1 ? "section" : "sections"} selected</p>
              <Button type="button" onClick={addSelectedSubjects} disabled={additions.length === 0 || exceedsUnitLimit} aria-describedby={additionLimitMessage ? "enrollment-add-feedback" : undefined} className="min-h-9 gap-1.5 rounded-md px-3 text-xs leading-[1.4] font-semibold max-sm:min-h-11">
                Add selected subjects <Plus className="size-3" aria-hidden="true" />
              </Button>
            </div>
          </footer>
        </section>

        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-background" aria-labelledby="enrollment-summary-title">
          <header className="flex min-h-[76px] items-center px-5">
            <h3 ref={summaryTitleRef} id="enrollment-summary-title" tabIndex={-1} className="rounded-sm text-base font-bold focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">Enrollment summary</h3>
          </header>
          <ul aria-label="Proposed enrollment subjects">
            {enrollment.map((offering) => (
              <li key={offering.id} className="flex min-h-[100px] flex-col gap-1 border-t border-border px-4 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs leading-[1.4] font-semibold text-primary">{offering.code} · {offering.section}</p>
                  <Button id={`enrollment-remove-${offering.id}`} type="button" variant="ghost" size="icon" aria-label={`Remove ${offering.code} from enrollment`} onClick={() => removeSubject(offering)} className="h-[26px] w-7 rounded-md bg-destructive-soft text-destructive hover:bg-destructive-soft hover:text-destructive max-sm:size-11">
                    <X className="size-3" aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-xs font-medium leading-[1.4]">{offering.title}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs leading-[1.4] text-muted-foreground">Lecture {offering.lectureUnits.toFixed(1)} units · Lab {offering.labUnits.toFixed(1)} units</p>
                  <p className="text-xs leading-[1.4] whitespace-nowrap text-muted-foreground"><span className="font-semibold text-primary">{(offering.lectureUnits + offering.labUnits).toFixed(1)}</span> units</p>
                </div>
              </li>
            ))}
          </ul>
          {enrollment.length === 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-border px-5 py-10 text-center text-xs text-muted-foreground">
              <BookOpen className="size-6 text-primary" aria-hidden="true" />
              <p>No subjects added yet.</p><p>Select sections, then choose Add selected subjects.</p>
            </div>
          )}
          <div className="flex flex-col gap-2.5 px-5 py-[18px]">
            <div className="flex items-center justify-between gap-3">
              <p id="enrollment-unit-label" className="text-xs leading-[1.4] font-semibold text-muted-foreground">Total selected units</p>
              <p className="text-sm font-bold text-primary" aria-live="polite">{totalUnits} of {unitLimit}</p>
            </div>
            <progress aria-labelledby="enrollment-unit-label" aria-valuetext={`${totalUnits} of ${unitLimit} units`} value={totalUnits} max={unitLimit} className="h-[7px] w-full overflow-hidden rounded bg-border accent-primary [&::-webkit-progress-bar]:bg-border [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" />
            <p className="text-xs leading-[1.4] text-muted-foreground">Subjects that exceed the unit limit cannot be added. Remove subjects to make room.</p>
          </div>
          <div className="flex gap-3 px-5 pt-2 pb-5">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" disabled={enrollment.length === 0} className="h-10 flex-1 rounded-md bg-destructive text-xs font-semibold text-destructive-foreground hover:bg-destructive/90">Remove all</Button>
              </AlertDialogTrigger>
              <AlertDialogContent onCloseAutoFocus={(event) => {
                if (enrollment.length === 0) { event.preventDefault(); searchRef.current?.focus(); }
              }}>
                <AlertDialogTitle>Remove all selected subjects?</AlertDialogTitle>
                <AlertDialogDescription>This clears your proposed enrollment. You can add subjects again from the available offerings.</AlertDialogDescription>
                <div className="flex flex-wrap justify-end gap-2">
                  <AlertDialogCancel>Keep subjects</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
                    setEnrollmentIds([]);
                    setMessage("Removed all subjects from your enrollment summary.");
                  }}>Remove all</AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" disabled={enrollment.length === 0} onClick={submitEnrollment} className="h-10 flex-1 rounded-md text-xs font-semibold">Submit</Button>
          </div>
        </section>
      </div>
      <EnrollmentValidationDialog
        issue={validationIssue}
        offerings={offerings}
        onClose={() => setValidationIssue(null)}
        onReview={reviewValidationIssue}
        onReturnFocus={() => validationFocusRef.current?.()}
      />
    </section>
  );
}
