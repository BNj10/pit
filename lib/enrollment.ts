import type {
  EnrollmentMeeting,
  EnrollmentOffering,
  EnrollmentRequirementIssue,
  EnrollmentSlots,
  EnrollmentValidationIssue,
} from "@/types/enrollment-types";

// A fixed locale and time zone keep server and client renders identical.
const slotsOpenDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function isEnrollmentOfferingAvailable(offering: EnrollmentOffering) {
  return offering.slots.status === "open" && offering.slots.available > 0;
}

function getTakenSlots(slots: Extract<EnrollmentSlots, { status: "open" }>) {
  return slots.capacity - slots.available;
}

/** Visible text for the Slots column: taken of capacity, e.g. "28 / 40" or a full "30 / 30", or the reservation. */
export function formatEnrollmentSlots(slots: EnrollmentSlots) {
  if (slots.status === "open") return `${getTakenSlots(slots)} / ${slots.capacity}`;
  if (slots.opensAt === null) return "Own department only";
  const opensAt = Date.parse(slots.opensAt);
  return Number.isFinite(opensAt) ? `Reserved until\n${slotsOpenDateFormatter.format(opensAt)}` : "Reserved";
}

/** Screen reader text for the Slots column, which avoids reading "28 / 40" as "28 slash 40". */
export function describeEnrollmentSlots(slots: EnrollmentSlots) {
  if (slots.status === "reserved") return formatEnrollmentSlots(slots).replace("\n", " ");
  const taken = `${getTakenSlots(slots)} of ${slots.capacity} slots taken`;
  return slots.available > 0 ? taken : `${taken}, full`;
}

export function getEnrollmentTotalUnits(offerings: readonly EnrollmentOffering[]) {
  return offerings.reduce((total, offering) => total + offering.lectureUnits + offering.labUnits, 0);
}

export function findEnrollmentScheduleConflict(
  selected: readonly EnrollmentOffering[],
  existing: readonly EnrollmentOffering[],
): Extract<EnrollmentValidationIssue, { type: "schedule-conflict" }> | null {
  for (const offering of selected) {
    for (const other of existing) {
      if (offering.id === other.id) continue;
      for (const selectedMeeting of offering.meetings) {
        for (const existingMeeting of other.meetings) {
          if (selectedMeeting.start < existingMeeting.end
            && existingMeeting.start < selectedMeeting.end
            && selectedMeeting.days.some((day) => existingMeeting.days.includes(day))) {
            return { type: "schedule-conflict", selected: offering, existing: other, selectedMeeting, existingMeeting };
          }
        }
      }
    }
  }
  return null;
}

export function getEnrollmentSubmissionIssue(
  enrollment: readonly EnrollmentOffering[],
  unitLimit: number,
  requirementIssues: readonly EnrollmentRequirementIssue[] = [],
  fullOnSubmitIds: readonly string[] = [],
): EnrollmentValidationIssue | null {
  const requirements = requirementIssues.filter((issue) => enrollment.some((offering) => offering.id === issue.offeringId));
  if (requirements.length > 0) return { type: "requirements", requirements };

  const full = enrollment.filter((offering) => !isEnrollmentOfferingAvailable(offering) || fullOnSubmitIds.includes(offering.id));
  if (full.length > 0) return { type: "slots-full", offerings: full };

  const totalUnits = getEnrollmentTotalUnits(enrollment);
  if (totalUnits > unitLimit) return { type: "unit-limit", totalUnits, unitLimit };

  for (let index = 1; index < enrollment.length; index++) {
    const conflict = findEnrollmentScheduleConflict([enrollment[index]], enrollment.slice(0, index));
    if (conflict) return conflict;
  }
  return null;
}

function formatTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")}${hour >= 12 ? "PM" : "AM"}`;
}

export function formatEnrollmentMeeting(meeting: EnrollmentMeeting) {
  return `${meeting.days.join("")} · ${formatTime(meeting.start)}–${formatTime(meeting.end)}`;
}

export function formatEnrollmentSchedule(meetings: readonly EnrollmentMeeting[]) {
  return meetings.map((meeting) => `${meeting.days.join("")} ${formatTime(meeting.start)}–${formatTime(meeting.end)}`).join("\n");
}
