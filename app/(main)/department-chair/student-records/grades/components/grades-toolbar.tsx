import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { GradesToolbarProps, StudentGradesSemester } from "@/types/student-grades-exports";

const semesterGroupLabels = {
  current: "Current school year",
  completed: "Completed school years",
} satisfies Record<StudentGradesSemester["schoolYearStatus"], string>;

export function GradesToolbar({
  semesters,
  selectedSemester,
  isReloading,
  onSemesterChange,
  onReload,
}: GradesToolbarProps) {
  const semesterGroups = (["current", "completed"] as const)
    .map((status) => ({ status, semesters: semesters.filter((semester) => semester.schoolYearStatus === status) }))
    .filter((group) => group.semesters.length > 0);

  return (
    <Card className="student-grades-toolbar">
      <header>
        <h1 id="student-grades-title" className="student-grades-title">Academic Records</h1>
        <p className="student-grades-subtitle">Review published grades</p>
      </header>
      <div className="student-grades-controls">
        <Select value={selectedSemester} onValueChange={onSemesterChange} disabled={isReloading}>
          <SelectTrigger className="student-grades-semester-select" aria-label="Academic semester">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end" sideOffset={8} className="student-grades-semester-menu">
            <p className="student-grades-semester-menu-heading" aria-hidden="true">
              <span>Academic semester</span>
              <span>Select a semester to review grades</span>
            </p>
            {semesterGroups.map((group, index) => (
              <SelectGroup key={group.status} className="student-grades-semester-group">
                {index > 0 && <SelectSeparator className="student-grades-semester-divider" />}
                <SelectLabel className="student-grades-semester-group-label">{semesterGroupLabels[group.status]}</SelectLabel>
                {group.semesters.map((semester) => (
                  <SelectItem key={semester.value} value={semester.value} className="student-grades-semester-option">
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="student-grades-reload" onClick={onReload} disabled={isReloading}>
          Reload records
          <RefreshCw aria-hidden="true" className={isReloading ? "student-grades-reloading" : undefined} />
        </Button>
      </div>
    </Card>
  );
}
