import type { NewPasswordErrors } from "@/types/auth-types";

// Matches the local Supabase Auth policy in supabase/config.toml.
export const MIN_PASSWORD_LENGTH = 6;

export function validateNewPassword(
  password: string,
  confirmPassword: string,
): NewPasswordErrors {
  const errors: NewPasswordErrors = {};

  if (!password) {
    errors.password = "Please enter a new password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Both passwords must match.";
  }

  return errors;
}
