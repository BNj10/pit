import * as z from "zod";

import { MIN_PASSWORD_LENGTH } from "./new-password-validation";

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

/** A new password and its confirmation; matches validateNewPassword() on the client. */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Please enter a new password.")
      .min(
        MIN_PASSWORD_LENGTH,
        `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      .max(72, "Your password must be 72 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Both passwords must match.",
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(EMAIL_PATTERN, "Please enter a valid email address (e.g. name@example.com)."),
});
