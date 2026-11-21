import type {
  EnrollmentMeeting,
  EnrollmentOffering,
  EnrollmentRequirementIssue,
  EnrollmentValidationIssue,
} from "@/types/enrollment-types";

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
): EnrollmentValidationIssue | null {
  const requirements = requirementIssues.filter((issue) => enrollment.some((offering) => offering.id === issue.offeringId));
  if (requirements.length > 0) return { type: "requirements", requirements };

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
