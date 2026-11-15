import { CalendarDays, GraduationCap, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StudentRecordsFiltersProps } from "@/types/student-records-exports";

export function StudentRecordsFilters({
  search,
  batch,
  yearStanding,
  batches,
  yearStandings,
  onSearchChange,
  onBatchChange,
  onYearStandingChange,
}: StudentRecordsFiltersProps) {
  return (
    <div className="student-records-filters">
      <div className="student-records-search">
        <Search aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search by name, email, or student number"
          placeholder="Search by name, email, or student number"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select value={batch} onValueChange={onBatchChange}>
        <SelectTrigger className="student-records-filter-select" aria-label="Filter by batch">
          <CalendarDays aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          <SelectItem value="all">All batches</SelectItem>
          {batches.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={yearStanding} onValueChange={onYearStandingChange}>
        <SelectTrigger className="student-records-filter-select" aria-label="Filter by year level">
          <GraduationCap aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          <SelectItem value="all">All year levels</SelectItem>
          {yearStandings.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
