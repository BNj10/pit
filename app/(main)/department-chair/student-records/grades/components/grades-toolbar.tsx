import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GradesToolbarProps } from "@/types/student-grades-exports";

export function GradesToolbar({
  semesters,
  selectedSemester,
  isReloading,
  onSemesterChange,
  onReload,
}: GradesToolbarProps) {
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
          <SelectContent position="popper" align="end">
            {semesters.map((semester) => (
              <SelectItem key={semester.value} value={semester.value}>{semester.label}</SelectItem>
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
