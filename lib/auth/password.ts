import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountFormFailure } from "@/types/auth-types";

type PasswordField = "password" | "confirmPassword";

type ParseResult =
  | { success: true }
  | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };

/** First error per field from newPasswordSchema.safeParse(). */
export function getPasswordFieldErrors(result: ParseResult) {
  const errors: Partial<Record<PasswordField, string>> = {};
  if (result.success) return errors;

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if ((field === "password" || field === "confirmPassword") && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

/** Sets the signed-in user's password. Returns field errors Supabase reports; throws otherwise. */
export async function setPassword(
  supabase: SupabaseClient,
  password: string,
  { allowSamePassword = false } = {},
): Promise<AccountFormFailure | null> {
  const { error } = await supabase.auth.updateUser({ password });

  if (!error) return null;
  if (error.code === "same_password") {
    return allowSamePassword
      ? null
      : { fieldErrors: { password: "Choose a password different from your current one." } };
  }
  if (error.code === "weak_password") {
    return { fieldErrors: { password: error.message } };
  }
  throw error;
}
