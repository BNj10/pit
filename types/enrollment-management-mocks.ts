import type { AcademicYear } from "./academic-calendar-types";
import type { EnrollmentManagementData, EnrollmentWindow } from "./enrollment-schedule-types";

// Synthetic UI fixtures. These are not the institution's calendar, its current
// term, or an approved enrollment policy. Replace through the same data contract.
const academicYears = [
  {
    id: "2027-2028",
    label: "2027–2028",
    status: "draft",
    terms: [{ kind: "first", status: "upcoming" }, { kind: "second", status: "upcoming" }, { kind: "summer", status: "upcoming" }],
  },
  {
    id: "2026-2027",
    label: "2026–2027",
    status: "draft",
    terms: [{ kind: "first", status: "upcoming" }, { kind: "second", status: "upcoming" }, { kind: "summer", status: "upcoming" }],
  },
  {
    id: "2025-2026",
    label: "2025–2026",
    status: "active",
    terms: [{ kind: "first", status: "completed" }, { kind: "second", status: "current" }, { kind: "summer", status: "upcoming" }],
  },
  {
    id: "2024-2025",
    label: "2024–2025",
    status: "completed",
    terms: [{ kind: "first", status: "completed" }, { kind: "second", status: "completed" }, { kind: "summer", status: "completed" }],
  },
] satisfies AcademicYear[];

// Sample windows from the design: year levels in turn, then open enrollment.
const secondSemesterWindows = [
  { group: "year-4", opensAt: "2026-01-05T08:00", closesAt: "2026-01-06T17:00" },
  { group: "year-3", opensAt: "2026-01-07T08:00", closesAt: "2026-01-08T17:00" },
  { group: "year-2", opensAt: "2026-01-09T08:00", closesAt: "2026-01-10T17:00" },
  { group: "year-1", opensAt: "2026-01-11T08:00", closesAt: "2026-01-12T17:00" },
  { group: "open", opensAt: "2026-01-13T08:00", closesAt: "2026-01-16T17:00" },
] satisfies EnrollmentWindow[];

export const enrollmentManagementPreview: EnrollmentManagementData = {
  academicYears,
  schedules: [
    { termId: "2025-2026:second", draft: secondSemesterWindows, published: secondSemesterWindows, paused: false },
  ],
};
