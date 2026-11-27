import * as z from "zod";

import { EMAIL_PATTERN, STUDENT_ID_PATTERN } from "@/lib/auth-validation";
import { studentInitials } from "@/lib/enrollment-review";
import type {
  StudentFormErrors,
  StudentFormValues,
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

export const emptyStudentForm: StudentFormValues = {
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
 * A student's details, when adding or editing them. Reuse it on the server when this
 * moves there, where it becomes authoritative. The ID matches the login format.
 */
export const studentDetailsSchema = z.object({
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
export function studentFieldErrors(error: z.ZodError): StudentFormErrors {
  const errors: StudentFormErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof StudentFormValues;
    errors[field] ??= issue.message;
  }
  return errors;
}

/**
 * The student ID is how a student logs in, so it can only change while they are
 * still invited. Once they finish account setup it is fixed.
 */
export function canEditStudentId(student: StudentRecordStudent) {
  return student.invitation !== undefined;
}

/** Form values for a student's current details. */
export function studentFormValues(student: StudentRecordStudent): StudentFormValues {
  const { name, email, studentNumber, yearStanding, batch } = student;
  return { name, email, studentNumber, yearStanding, batch };
}

/**
 * Checks field formats and duplicates among the listed students. When editing,
 * `current` is the student being changed: it isn't its own duplicate, and its ID
 * stays fixed once it has finished account setup. Returns the student's details,
 * or the first error for each invalid field.
 */
export function validateStudentDetails(
  values: StudentFormValues,
  students: readonly StudentRecordStudent[],
  current?: StudentRecordStudent,
): { errors: StudentFormErrors; student: StudentRecordStudent | null } {
  const result = studentDetailsSchema.safeParse(values);
  if (!result.success) return { errors: studentFieldErrors(result.error), student: null };

  const { name, email, studentNumber, yearStanding, batch } = result.data;
  const others = students.filter((student) => student.studentNumber !== current?.studentNumber);
  const errors: StudentFormErrors = {};
  if (others.some((student) => student.email.toLowerCase() === email)) {
    errors.email = "Another student already uses this email.";
  }
  if (current && !canEditStudentId(current) && studentNumber !== current.studentNumber) {
    errors.studentNumber = "The student ID can't change after the student sets up their account.";
  } else if (others.some((student) => student.studentNumber === studentNumber)) {
    errors.studentNumber = "Another student already has this student ID.";
  }
  if (Object.keys(errors).length > 0) return { errors, student: null };

  return {
    errors,
    student: { studentNumber, name, initials: studentInitials(name), email, yearStanding, batch },
  };
}
