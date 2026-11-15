import type {
  CrossDepartmentAccess,
  CurriculumSubject,
  CurriculumYearLevel,
  MeetingDay,
  OfferingTerm,
  SectionClassType,
  SectionEntry,
  SectionEntryConflict,
  SectionEntryDraft,
  SectionEntryValidation,
  SectionsWorkspace,
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

/** "TBA" holds a room slot without booking a real room, so it never causes a room conflict. */
export function isUnassignedRoom(room: string) {
  return normalize(room) === "TBA";
}

export function subjectUnits(subject: Pick<CurriculumSubject, "lectureUnits" | "laboratoryUnits">) {
  return subject.lectureUnits + subject.laboratoryUnits;
}

/** e.g. "2 lec · 1 lab units" or "3 lec units". */
export function describeSubjectUnits(subject: Pick<CurriculumSubject, "lectureUnits" | "laboratoryUnits">) {
  const parts = [
    subject.lectureUnits > 0 ? `${formatHours(subject.lectureUnits)} lec` : null,
    subject.laboratoryUnits > 0 ? `${formatHours(subject.laboratoryUnits)} lab` : null,
  ].filter((part) => part !== null);
  return `${parts.join(" · ")} ${subjectUnits(subject) === 1 ? "unit" : "units"}`;
}

export function academicYearLabel(academicYear: string) {
  return `A.Y. ${academicYear}`;
}

/** Access times are Philippine local time, independent of the viewer's device. */
export function accessTimestamp(value: string) {
  return new Date(`${value}+08:00`).getTime();
}

const accessDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatAccessDate(value: string) {
  const timestamp = accessTimestamp(value);
  return Number.isFinite(timestamp) ? accessDateFormatter.format(timestamp) : "—";
}

/**
 * Whether other departments' students can currently take remaining seats.
 * isOpen is null while the current time is unknown (server render).
 */
export function crossDepartmentAccessState(access: CrossDepartmentAccess, now: number | null) {
  if (access.mode === "open") return { isOpen: true, label: "Open to all departments" };
  if (access.mode === "reserved") return { isOpen: false, label: "Own department only" };
  const opensAt = accessTimestamp(access.opensAt);
  if (now !== null && now >= opensAt) return { isOpen: true, label: "Open to all departments" };
  return { isOpen: now === null ? null : false, label: `Own department until ${formatAccessDate(access.opensAt)}` };
}

function overlaps(a: Pick<SectionEntry, "days" | "startTime" | "endTime">, b: SectionEntry) {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  return a.days.some((day) => b.days.includes(day)) && aStart < bEnd && bStart < aEnd;
}

/** Other entries that meet at the same time for the same section block, room, or faculty member. */
export function findSectionConflicts(
  candidate: Pick<SectionEntry, "section" | "days" | "startTime" | "endTime" | "room" | "facultyId">,
  entries: readonly SectionEntry[],
  ignoreId?: string,
): SectionEntryConflict[] {
  return entries.flatMap((entry): SectionEntryConflict[] => {
    if (entry.id === ignoreId || !overlaps(candidate, entry)) return [];
    if (normalize(entry.section) === normalize(candidate.section)) return [{ kind: "section", entry }];
    if (!isUnassignedRoom(candidate.room) && normalize(entry.room) === normalize(candidate.room)) return [{ kind: "room", entry }];
    if (candidate.facultyId !== null && entry.facultyId === candidate.facultyId) return [{ kind: "faculty", entry }];
    return [];
  });
}

export function draftFromEntry(entry?: SectionEntry): SectionEntryDraft {
  return entry
    ? { ...entry, capacity: String(entry.capacity), facultyId: entry.facultyId ?? "" }
    : { section: "", capacity: "", classType: "lecture", facultyId: "", days: [], startTime: "", endTime: "", room: "" };
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
    ? findSectionConflicts({ ...draft, facultyId: draft.facultyId || null }, entries, ignoreId)
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
    facultyId: draft.facultyId || null,
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

/**
 * Content fingerprint of one year level's offerings. It ignores generated ids, so
 * undoing a change (or re-adding a removed subject) matches the published version again.
 */
export function yearOfferingSignature(workspace: SectionsWorkspace, academicYear: string, yearLevel: CurriculumYearLevel) {
  const offerings = workspace.offerings.filter((offering) =>
    offering.academicYear === academicYear && offering.yearLevel === yearLevel,
  );
  const offeringKeys = new Map(offerings.map((offering) => [offering.id, `${offering.term}|${offering.subjectCode}`]));
  const access = offerings.map((offering) => `${offering.term}|${offering.subjectCode}|${JSON.stringify(offering.crossDepartmentAccess)}`);
  const entries = workspace.entries.flatMap((entry) => {
    const key = offeringKeys.get(entry.offeringId);
    if (!key) return [];
    return [[key, entry.section, entry.classType, entry.facultyId ?? "", entry.capacity, entry.days.join(""), entry.startTime, entry.endTime, entry.room].join("|")];
  });
  return JSON.stringify({
    terms: workspace.termGroups
      .filter((group) => group.academicYear === academicYear && group.yearLevel === yearLevel)
      .map((group) => group.term)
      .sort(),
    offerings: [...offeringKeys.values()].sort(),
    access: access.sort(),
    entries: entries.sort(),
  });
}
