import type {
  CurriculumSubject,
  MeetingDay,
  OfferingTerm,
  SectionClassType,
  SectionEntry,
  SectionEntryConflict,
  SectionEntryDraft,
  SectionEntryValidation,
  SubjectOffering,
} from "@/types/sections-types";

export const meetingDays = ["M", "T", "W", "Th", "F", "Sa"] as const satisfies readonly MeetingDay[];

export const meetingDayNames: Record<MeetingDay, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  Sa: "Saturday",
};

export const offeringTerms = [
  { value: "first", label: "First Semester", badge: "1" },
  { value: "second", label: "Second Semester", badge: "2" },
  { value: "summer", label: "Summer", badge: "S" },
] as const satisfies readonly { value: OfferingTerm; label: string; badge: string }[];

export function offeringTermLabel(term: OfferingTerm) {
  return offeringTerms.find((item) => item.value === term)?.label ?? term;
}

export const classTypeLabels: Record<SectionClassType, { label: string; short: string }> = {
  lecture: { label: "Lecture", short: "LEC" },
  laboratory: { label: "Laboratory", short: "LAB" },
};

/** Minutes after midnight for an "HH:MM" value, or null when it is not a valid time. */
export function timeToMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

function formatClock(value: string) {
  const minutes = timeToMinutes(value);
  if (minutes === null) return value;
  const hours = Math.floor(minutes / 60) % 12 || 12;
  return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Compact schedule label used in the design, e.g. "MW · 8:00–9:30". */
export function formatSectionSchedule(entry: Pick<SectionEntry, "days" | "startTime" | "endTime">) {
  const days = meetingDays.filter((day) => entry.days.includes(day)).join("");
  return `${days} · ${formatClock(entry.startTime)}–${formatClock(entry.endTime)}`;
}

/** Spoken schedule for assistive technology, which cannot infer AM/PM from the compact label. */
export function describeSectionSchedule(entry: Pick<SectionEntry, "days" | "startTime" | "endTime">) {
  const toSpoken = (value: string) => {
    const minutes = timeToMinutes(value);
    if (minutes === null) return value;
    const suffix = minutes < 12 * 60 ? "AM" : "PM";
    return `${formatClock(value)} ${suffix}`;
  };
  const days = meetingDays.filter((day) => entry.days.includes(day)).map((day) => meetingDayNames[day]).join(", ");
  return `${days}, ${toSpoken(entry.startTime)} to ${toSpoken(entry.endTime)}`;
}

export function weeklyHours(entry: Pick<SectionEntry, "days" | "startTime" | "endTime">) {
  const start = timeToMinutes(entry.startTime);
  const end = timeToMinutes(entry.endTime);
  if (start === null || end === null || end <= start) return null;
  return ((end - start) * entry.days.length) / 60;
}

export function formatHours(hours: number) {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function hourLimitFor(subject: CurriculumSubject, classType: SectionClassType) {
  return classType === "lecture" ? subject.lectureHoursPerWeek : subject.laboratoryHoursPerWeek;
}

/** Stable DOM id for an offered subject's collapsible section panel. */
export function subjectSectionsId(offeringId: string) {
  return `subject-sections-${offeringId.replace(/[^a-z0-9-]/gi, "-").toLocaleLowerCase()}`;
}

/** Shown before removals so the chair knows how much schedule work is lost. */
export function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleUpperCase();

function overlaps(a: Pick<SectionEntry, "days" | "startTime" | "endTime">, b: SectionEntry) {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  return a.days.some((day) => b.days.includes(day)) && aStart < bEnd && bStart < aEnd;
}

/** Other entries that meet at the same time in the same room or for the same section block. */
export function findSectionConflicts(
  candidate: Pick<SectionEntry, "section" | "days" | "startTime" | "endTime" | "room">,
  entries: readonly SectionEntry[],
  ignoreId?: string,
): SectionEntryConflict[] {
  return entries.flatMap((entry): SectionEntryConflict[] => {
    if (entry.id === ignoreId || !overlaps(candidate, entry)) return [];
    if (normalize(entry.section) === normalize(candidate.section)) return [{ kind: "section", entry }];
    if (normalize(entry.room) === normalize(candidate.room)) return [{ kind: "room", entry }];
    return [];
  });
}

export function draftFromEntry(entry?: SectionEntry): SectionEntryDraft {
  return entry
    ? { ...entry, capacity: String(entry.capacity) }
    : { section: "", capacity: "", classType: "lecture", days: [], startTime: "", endTime: "", room: "" };
}

/**
 * Preview validation for the section editor. Production must repeat these checks
 * on the server and enforce conflicts atomically in the database.
 */
export function validateSectionEntry(
  draft: SectionEntryDraft,
  subject: CurriculumSubject,
  entries: readonly SectionEntry[],
  ignoreId?: string,
): SectionEntryValidation {
  const hourLimit = hourLimitFor(subject, draft.classType);
  const capacity = Number(draft.capacity);
  const start = timeToMinutes(draft.startTime);
  const end = timeToMinutes(draft.endTime);
  const missing = [
    !draft.section.trim() && "Enter a section.",
    (!Number.isInteger(capacity) || capacity < 1) && "Enter a capacity of at least 1.",
    hourLimit === 0 && `${subject.code} has no ${classTypeLabels[draft.classType].label.toLocaleLowerCase()} hours in the curriculum.`,
    draft.days.length === 0 && "Select at least one meeting day.",
    (start === null || end === null) && "Enter a start and end time.",
    start !== null && end !== null && end <= start && "The end time must be after the start time.",
    !draft.room.trim() && "Enter a room.",
  ].filter((message): message is string => typeof message === "string");

  const scheduleComplete = draft.days.length > 0 && start !== null && end !== null && end > start;
  const entryHours = scheduleComplete ? weeklyHours(draft) : null;
  const sameBlockHours = entries
    .filter((entry) =>
      entry.id !== ignoreId &&
      entry.subjectCode === subject.code &&
      entry.classType === draft.classType &&
      normalize(entry.section) === normalize(draft.section),
    )
    .reduce((sum, entry) => sum + (weeklyHours(entry) ?? 0), 0);
  const totalHours = entryHours === null ? null : sameBlockHours + entryHours;
  const conflicts = scheduleComplete && draft.room.trim() && draft.section.trim()
    ? findSectionConflicts(draft, entries, ignoreId)
    : [];

  return {
    missing,
    conflicts,
    entryHours,
    totalHours,
    hourLimit,
    canSave: missing.length === 0 && conflicts.length === 0 && totalHours !== null && totalHours <= hourLimit,
  };
}

export function entryFromDraft(draft: SectionEntryDraft, offering: SubjectOffering, id: string): SectionEntry {
  return {
    id,
    offeringId: offering.id,
    subjectCode: offering.subjectCode,
    section: draft.section.trim().replace(/\s+/g, " "),
    classType: draft.classType,
    capacity: Number(draft.capacity),
    days: meetingDays.filter((day) => draft.days.includes(day)),
    startTime: draft.startTime,
    endTime: draft.endTime,
    room: draft.room.trim().replace(/\s+/g, " ").toLocaleUpperCase(),
  };
}

/** Orders entries by section block, lecture before laboratory, then start time. */
export function compareSectionEntries(a: SectionEntry, b: SectionEntry) {
  const typeOrder = (entry: SectionEntry) => (entry.classType === "lecture" ? 0 : 1);
  return typeOrder(a) - typeOrder(b) ||
    a.section.localeCompare(b.section, undefined, { numeric: true }) ||
    a.startTime.localeCompare(b.startTime);
}
