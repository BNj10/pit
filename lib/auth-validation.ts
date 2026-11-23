import * as z from "zod";

export const EMAIL_PATTERN = /^[a-z\d!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z\d!#$%&'*+/=?^_`{|}~-]+)*@[a-z\d](?:[a-z\d-]*[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]*[a-z\d])?)+$/i;

export const STUDENT_ID_PATTERN = /^\d{2}-\d{4}-\d{3}$/;

/** Server-side login input. The identifier is either an email or a student ID. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine(
      (value) => EMAIL_PATTERN.test(value) || STUDENT_ID_PATTERN.test(value),
      "Enter your email or ID number.",
    ),
  password: z.string().min(1, "Enter your password.").max(72),
});
