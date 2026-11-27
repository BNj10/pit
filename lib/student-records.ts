import * as z from "zod";

import { EMAIL_PATTERN, STUDENT_ID_PATTERN } from "@/lib/auth-validation";
import { studentInitials } from "@/lib/enrollment-review";
import type {
  NewStudentFormErrors,
  NewStudentFormValues,
  StudentRecordStudent,
} from "@/types/student-records-types";

export function findStudentRecord(
  students: readonly StudentRecordStudent[],
  studentNumber: string | string[] | undefined,
) {
  // Resolve only an exact fixture identity; never fall back to another student.
  if (typeof studentNumber !== "string") return undefined;
  return students.find((student) => student.studentNumber === studentNumber);
}

export const studentNameMaxLength = 100;

/**
 * How long an invitation link works. Shortened to 10 seconds so the expired state is
 * quick to see in the preview; real auth email links last 1 hour (otp_expiry).
 */
export const invitationLifetimeMs = 10 * 1000;

export function isInvitationExpired(invitation: { sentAt: string }, now: number) {
  return Date.parse(invitation.sentAt) + invitationLifetimeMs <= now;
}

/** Year standings a student can hold; matches the database check on profiles. */
export const studentYearStandings = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

export const emptyNewStudent: NewStudentFormValues = {
  name: "",
  email: "",
  studentNumber: "",
  yearStanding: "",
  batch: "",
};

/** Accepts 2026–2030 or 2026-2030 and stores it with an en dash. */
const batchSchema = z
  .string()
  .trim()
  .min(1, "Enter the batch.")
  .regex(/^\d{4}\s*[–-]\s*\d{4}$/, "Enter the batch as two years, e.g. 2026–2030.")
  .transform((value) => value.split(/\s*[–-]\s*/).map(Number))
  .refine(([start, end]) => end > start, "The end year must come after the start year.")
  .transform(([start, end]) => `${start}–${end}`);

/**
 * Fields of a new student. Reuse it on the server when adding students moves there,
 * where it becomes authoritative. The ID matches the format students log in with.
 */
export const newStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the student's full name.")
    .max(studentNameMaxLength, `Use ${studentNameMaxLength} characters or fewer.`),
  email: z
    .string()
    .trim()
    .min(1, "Enter the student's university email.")
    .regex(EMAIL_PATTERN, "Enter a valid email address (e.g. name@university.edu).")
    .transform((value) => value.toLowerCase()),
  studentNumber: z
    .string()
    .trim()
    .min(1, "Enter the student ID.")
    .regex(STUDENT_ID_PATTERN, "Enter the student ID in the format 00-0000-000."),
  yearStanding: z.enum(studentYearStandings, "Choose a year standing."),
  batch: batchSchema,
});

/** First error message for each invalid field. */
export function newStudentFieldErrors(error: z.ZodError): NewStudentFormErrors {
  const errors: NewStudentFormErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof NewStudentFormValues;
    errors[field] ??= issue.message;
  }
  return errors;
}

/**
 * Checks field formats and duplicates among the listed students. Returns the
 * student to add, or the first error for each invalid field.
 */
export function validateNewStudent(
  values: NewStudentFormValues,
  students: readonly StudentRecordStudent[],
): { errors: NewStudentFormErrors; student: StudentRecordStudent | null } {
  const result = newStudentSchema.safeParse(values);
  if (!result.success) return { errors: newStudentFieldErrors(result.error), student: null };

  const { name, email, studentNumber, yearStanding, batch } = result.data;
  const errors: NewStudentFormErrors = {};
  if (students.some((student) => student.email.toLowerCase() === email)) {
    errors.email = "Another student already uses this email.";
  }
  if (students.some((student) => student.studentNumber === studentNumber)) {
    errors.studentNumber = "Another student already has this student ID.";
  }
  if (Object.keys(errors).length > 0) return { errors, student: null };

  return {
    errors,
    student: { studentNumber, name, initials: studentInitials(name), email, yearStanding, batch },
  };
}
