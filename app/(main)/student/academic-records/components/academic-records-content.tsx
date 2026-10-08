"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AcademicRecordsContentProps } from "@/types/academic-records-exports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AcademicRecordsContent({
  semesterGroups,
  initialSemester,
  records,
}: AcademicRecordsContentProps) {
  const router = useRouter();
  const [isReloading, startTransition] = useTransition();
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const semesterTriggerRef = useRef<HTMLButtonElement>(null);
  const pointerInteractionRef = useRef(false);
  const semesters = semesterGroups.flatMap((group) => group.semesters);

  return (
    <main className="academic-records-content" aria-labelledby="academic-records-title">
      <Card className="academic-records-controls">
        <header className="academic-records-introduction">
          <h2 id="academic-records-title" className="academic-records-page-title">
            Academic Records &amp; Grades
          </h2>
          <p className="academic-records-subtitle">
            Review grades by academic year and semester.
          </p>
        </header>
        <div className="academic-records-actions">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                ref={semesterTriggerRef}
                type="button"
                variant="outline"
                className="academic-records-semester-select"
                aria-label={`Academic semester: ${selectedSemester.label}`}
                disabled={isReloading}
                onPointerDownCapture={() => { pointerInteractionRef.current = true; }}
                onKeyDownCapture={() => { pointerInteractionRef.current = false; }}
              >
                {selectedSemester.label}
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="academic-records-semester-menu"
              align="end"
              sideOffset={8}
              aria-labelledby="academic-records-menu-title"
              aria-describedby="academic-records-menu-hint"
              onPointerDownCapture={() => { pointerInteractionRef.current = true; }}
              onKeyDownCapture={() => { pointerInteractionRef.current = false; }}
              onPointerDownOutside={() => {
                // Non-modal dismissal leaves focus on the clicked outside target.
                pointerInteractionRef.current = false;
              }}
              onCloseAutoFocus={(event) => {
                if (!pointerInteractionRef.current) return;
                event.preventDefault();
                // Restore the tab starting point without retaining pointer focus.
                semesterTriggerRef.current?.focus({ preventScroll: true });
                semesterTriggerRef.current?.blur();
                pointerInteractionRef.current = false;
              }}
            >
              <DropdownMenuLabel className="academic-records-semester-menu-heading">
                <p id="academic-records-menu-title">Academic records</p>
                <p id="academic-records-menu-hint">Select a semester to view your grades</p>
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                className="academic-records-semester-options"
                value={selectedSemester.value}
                onValueChange={(value) => {
                  const semester = semesters.find((item) => item.value === value);
                  if (semester) setSelectedSemester(semester);
                }}
              >
                {semesterGroups.map((group, index) => (
                  <Fragment key={group.year}>
                    {index > 0 && (
                      <DropdownMenuSeparator className="academic-records-semester-divider" />
                    )}
                    <DropdownMenuGroup
                      className="academic-records-semester-year"
                      aria-label={`Academic year ${group.year}`}
                    >
                      {group.semesters.map((semester) => (
                        <DropdownMenuRadioItem
                          key={semester.value}
                          value={semester.value}
                          className="academic-records-semester-option"
                        >
                          {semester.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuGroup>
                  </Fragment>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="outline"
            className="academic-records-reload-button"
            disabled={isReloading}
            onClick={() => startTransition(() => router.refresh())}
          >
            {isReloading ? "Reloading…" : "Reload records"}
            <RefreshCw aria-hidden="true" />
          </Button>
        </div>
      </Card>
      <div aria-busy={isReloading}>
        {records[selectedSemester.value] ?? (
          <Card className="academic-records-empty-record" role="status">
            <h3>{selectedSemester.label}</h3>
            <p>No academic records are available for this semester.</p>
          </Card>
        )}
      </div>
      <p className="sr-only" role="status">
        {isReloading ? "Reloading academic records." : ""}
      </p>
    </main>
  );
}
