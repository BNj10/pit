"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DepartmentChairEvaluationStatusFilter } from "@/types/faculty-evaluation-types";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "evaluated", label: "Evaluated" },
] as const satisfies readonly { value: DepartmentChairEvaluationStatusFilter; label: string }[];

interface EvaluationStatusFilterProps {
  value: DepartmentChairEvaluationStatusFilter;
  onChange: (value: DepartmentChairEvaluationStatusFilter) => void;
}

export function EvaluationStatusFilter({ value, onChange }: EvaluationStatusFilterProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const option = statusOptions.find((item) => item.value === next);
        if (option) onChange(option.value);
      }}
    >
      <SelectTrigger className="chair-evaluation-status-trigger" aria-label="Filter by evaluation status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end" sideOffset={8} className="chair-evaluation-status-menu">
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="chair-evaluation-status-option">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
