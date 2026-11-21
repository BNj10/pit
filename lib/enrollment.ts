import type {
  EnrollmentClassType,
  EnrollmentMeeting,
  EnrollmentMeetingDay,
  EnrollmentStatus,
  EnrollmentSubject,
  EnrollmentTerm,
  EnrollmentTermKind,
  EnrollmentYearLevel,
  StudentEnrollment,
} from "@/types/enrollment-types";

export const enrollmentStatuses = [
  { value: "pending-review", label: "Pending review" },
  { value: "returned", label: "Returned" },
  { value: "approved", label: "Approved" },
  { value: "enrolled", label: "Enrolled" },
  { value: "not-submitted", label: "Not submitted" },
] as const satisfies readonly { value: EnrollmentStatus; label: string }[];

export function enrollmentStatusLabel(status: EnrollmentStatus) {
  return enrollmentStatuses.find((item) => item.value === status)?.label ?? status;
}

export const enrollmentYearLevels = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
] as const satisfies readonly { value: EnrollmentYearLevel; label: string }[];

export function yearLevelLabel(yearLevel: EnrollmentYearLevel) {
  return enrollmentYearLevels.find((item) => item.value === yearLevel)?.label ?? `Year ${yearLevel}`;
}

const termNames: Record<EnrollmentTermKind, { label: string; order: number }> = {
  first: { label: "1st Semester", order: 0 },
  second: { label: "2nd Semester", order: 1 },
  summer: { label: "Summer", order: 2 },
};

export function enrollmentTermLabel(term: EnrollmentTerm) {
  return `A.Y. ${term.academicYear} · ${termNames[term.term].label}`;
}

/** Newest first: later academic year, then summer, second, and first semester. */
export function compareTermsNewestFirst(a: EnrollmentTerm, b: EnrollmentTerm) {
  return b.academicYear.localeCompare(a.academicYear) || termNames[b.term].order - termNames[a.term].order;
}

/** Terms that have enrollment records, newest first; the first is the term students are enrolling into. */
export function termsWithEnrollments(terms: readonly EnrollmentTerm[], enrollments: readonly StudentEnrollment[]) {
  return terms
    .filter((term) => enrollments.some((enrollment) => enrollment.termId === term.id))
    .sort(compareTermsNewestFirst);
}

const statusOrder: Record<EnrollmentStatus, number> = {
  "pending-review": 0,
  returned: 1,
  approved: 2,
  enrolled: 3,
  "not-submitted": 4,
};

/** Review queue order: pending first, oldest submission first within each status. */
export function compareEnrollments(a: StudentEnrollment, b: StudentEnrollment) {
  return statusOrder[a.status] - statusOrder[b.status] ||
    (a.submittedAt ?? "").localeCompare(b.submittedAt ?? "") ||
    a.student.name.localeCompare(b.student.name);
}

export function subjectUnits(subject: EnrollmentSubject) {
  return subject.parts.reduce((sum, part) => sum + part.units, 0);
}

export function classTypeUnits(subject: EnrollmentSubject, classType: EnrollmentClassType) {
  return subject.parts.filter((part) => part.classType === classType).reduce((sum, part) => sum + part.units, 0);
}

export function enrollmentUnits(enrollment: Pick<StudentEnrollment, "subjects">) {
  return enrollment.subjects.reduce((sum, subject) => sum + subjectUnits(subject), 0);
}

export function formatUnits(units: number) {
  return units.toFixed(1);
}

const dayOrder: readonly EnrollmentMeetingDay[] = ["M", "T", "W", "Th", "F", "Sa"];

function formatClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

/** Design format, e.g. "MW 8:00AM–9:30AM". */
export function formatMeeting(meeting: EnrollmentMeeting) {
  const days = dayOrder.filter((day) => meeting.days.includes(day)).join("");
  return `${days} ${formatClock(meeting.startTime)}–${formatClock(meeting.endTime)}`;
}

// Fixed to Philippine time so the server and every browser render the same text.
const submittedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const toTimestamp = (value: string) => new Date(`${value}+08:00`).getTime();

/** e.g. "Jul 28 · 9:18 AM". */
export function formatSubmittedAt(value: string) {
  const parts = submittedFormatter.formatToParts(toTimestamp(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("month")} ${part("day")} · ${part("hour")}:${part("minute")} ${part("dayPeriod")}`;
}

export function formatLongDate(value: string) {
  return longDateFormatter.format(toTimestamp(value));
}

/** Current Philippine time in the fixtures' "YYYY-MM-DDTHH:MM" format. */
export function manilaTimestampNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(Date.now());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function studentInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}`.toLocaleUpperCase();
}
