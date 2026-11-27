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

export const emptyNewStudent: NewStudentFormValues = {
  name: "",
  email: "",
  studentNumber: "",
  yearStanding: "",
  batch: "",
};

/** Field formats for a new student; the ID matches the format students log in with. */
const newStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the student's full name.")
    .max(studentNameMaxLength, `Use ${studentNameMaxLength} characters or fewer.`),
  email: z
    .string()
    .trim()
    .min(1, "Enter the student's university email.")
    .regex(EMAIL_PATTERN, "Enter a valid email address (e.g. name@university.edu)."),
  studentNumber: z
    .string()
    .trim()
    .min(1, "Enter the student ID.")
    .regex(STUDENT_ID_PATTERN, "Enter the student ID in the format 00-0000-000."),
  yearStanding: z.string().min(1, "Choose a year standing."),
  batch: z.string().min(1, "Choose a batch."),
});

/**
 * Validates a new student against the listed students. Returns the student to
 * add, or the first error for each invalid field.
 */
export function validateNewStudent(
  values: NewStudentFormValues,
  students: readonly StudentRecordStudent[],
  options: { yearStandings: readonly string[]; batches: readonly string[] },
): { errors: NewStudentFormErrors; student: StudentRecordStudent | null } {
  const errors: NewStudentFormErrors = {};
  const result = newStudentSchema.safeParse(values);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof NewStudentFormValues;
      errors[field] ??= issue.message;
    }
    return { errors, student: null };
  }

  const { name, studentNumber, yearStanding, batch } = result.data;
  const email = result.data.email.toLowerCase();

  if (students.some((student) => student.email.toLowerCase() === email)) {
    errors.email = "Another student already uses this email.";
  }
  if (students.some((student) => student.studentNumber === studentNumber)) {
    errors.studentNumber = "Another student already has this student ID.";
  }
  if (!options.yearStandings.includes(yearStanding)) errors.yearStanding = "Choose a year standing.";
  if (!options.batches.includes(batch)) errors.batch = "Choose a batch.";

  if (Object.keys(errors).length > 0) return { errors, student: null };

  return {
    errors,
    student: { studentNumber, name, initials: studentInitials(name), email, yearStanding, batch },
  };
}
