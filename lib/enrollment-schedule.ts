import { schoolTimestamp } from "@/lib/school-time";
import type {
  EnrollmentGroup,
  EnrollmentGroupAccess,
  EnrollmentPublishErrors,
  EnrollmentSchedule,
  EnrollmentWindow,
  EnrollmentWindowErrors,
  EnrollmentWindowStatus,
} from "@/types/enrollment-schedule-types";

// Preview rules for the Dean's school-wide enrollment schedule. Window order and
// overlap are not enforced until the institution confirms its enrollment policy.

export const enrollmentGroupOrder: readonly EnrollmentGroup[] = ["year-4", "year-3", "year-2", "year-1", "open"];

const groupLabels: Record<EnrollmentGroup, string> = {
  "year-4": "4th year",
  "year-3": "3rd year",
  "year-2": "2nd year",
  "year-1": "1st year",
  open: "Open enrollment",
};

export function enrollmentGroupLabel(group: EnrollmentGroup) {
  return groupLabels[group];
}

export const enrollmentWindowStatusLabels: Record<EnrollmentWindowStatus, string> = {
  scheduled: "Scheduled",
  open: "Open",
  closed: "Closed",
  paused: "Paused",
};

export function blankEnrollmentWindows(): EnrollmentWindow[] {
  return enrollmentGroupOrder.map((group) => ({ group, opensAt: "", closesAt: "" }));
}

/** Splits "YYYY-MM-DDTHH:mm" into the values of a date input and a time input. */
export function splitSchoolDateTime(value: string) {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

/** Joins date and time input values; incomplete when either is empty. */
export function joinSchoolDateTime(date: string, time: string) {
  return date || time ? `${date}T${time}` : "";
}

/** A window with no times at all; its group is left for a later publish. */
export function isBlankEnrollmentWindow(window: EnrollmentWindow) {
  return !window.opensAt && !window.closesAt;
}

/**
 * Checks the windows to publish. Blank windows are skipped, so one group can be
 * published without the others; at least one window must be set.
 */
export function validateEnrollmentWindows(windows: readonly EnrollmentWindow[]): EnrollmentPublishErrors | null {
  const errors: EnrollmentWindowErrors = {};
  for (const window of windows) {
    if (isBlankEnrollmentWindow(window)) continue;
    const label = enrollmentGroupLabel(window.group);
    const opens = schoolTimestamp(window.opensAt);
    const closes = schoolTimestamp(window.closesAt);
    if (!Number.isFinite(opens) || !Number.isFinite(closes)) {
      errors[window.group] = `${label}: set both the opening and closing date and time, or clear them to publish this group later.`;
    } else if (closes <= opens) {
      errors[window.group] = `${label}: the closing time must be after the opening time.`;
    }
  }
  if (Object.keys(errors).length) return { windows: errors };
  if (windows.every(isBlankEnrollmentWindow)) {
    return { windows: {}, form: "Set at least one group's opening and closing times to publish." };
  }
  return null;
}

/** The windows students would see if published now: every group whose times are set. */
export function publishableEnrollmentWindows(windows: readonly EnrollmentWindow[]) {
  return windows.filter((window) => !isBlankEnrollmentWindow(window));
}

export function enrollmentWindowStatus(window: EnrollmentWindow, now: number, paused: boolean): EnrollmentWindowStatus {
  if (now >= schoolTimestamp(window.closesAt)) return "closed";
  if (paused) return "paused";
  return now < schoolTimestamp(window.opensAt) ? "scheduled" : "open";
}

/**
 * What a group's students get. A group without a published window sees no
 * enrollment at all; with one, students see it but can enroll only while it is
 * open. Use this on student-facing pages, together with the eligibility checks.
 */
export function enrollmentGroupAccess(
  schedule: Pick<EnrollmentSchedule, "published" | "paused"> | undefined,
  group: EnrollmentGroup,
  now: number,
): EnrollmentGroupAccess {
  const window = schedule?.published?.find((item) => item.group === group) ?? null;
  if (!schedule || !window) return { visible: false, canEnroll: false, window: null };
  return { visible: true, canEnroll: enrollmentWindowStatus(window, now, schedule.paused) === "open", window };
}

export function sameEnrollmentWindows(a: readonly EnrollmentWindow[], b: readonly EnrollmentWindow[]) {
  return a.length === b.length && a.every((window, index) =>
    window.group === b[index].group && window.opensAt === b[index].opensAt && window.closesAt === b[index].closesAt);
}
