"use server";

import { redirect } from "next/navigation";

import { SAVE_FAILED_MESSAGE, STUDENT_ID_MISSING_MESSAGE } from "@/lib/auth/messages";
import { LOGIN_PATH, ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { getAccountEntryPath, getCurrentAccount, isMissingStudentId } from "@/lib/auth/session";
import { newPasswordSchema } from "@/lib/auth-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountFormFailure } from "@/types/auth-types";

import { getPasswordFieldErrors, setPassword } from "@/lib/auth/password";

/**
 * Finishes an invited account: sets the password, then marks setup complete. A
 * student's ID is recorded before they are invited, so setup never asks for it.
 * Each step is safe to retry.
 */
export async function completeAccountSetup(formData: FormData): Promise<AccountFormFailure> {
  const account = await getCurrentAccount();
  if (!account) redirect(LOGIN_PATH);
  if (account.setupComplete) redirect(getAccountEntryPath(account));
  // Setup can't finish without the ID, so don't change the password first.
  if (isMissingStudentId(account)) return { fieldErrors: {}, message: STUDENT_ID_MISSING_MESSAGE };

  const passwords = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!passwords.success) return { fieldErrors: getPasswordFieldErrors(passwords) };

  const supabase = await createSupabaseServerClient();

  try {
    // A retry after a failed attempt may resend the same password.
    const passwordFailure = await setPassword(supabase, passwords.data.password, {
      allowSamePassword: true,
    });
    if (passwordFailure) return passwordFailure;

    const { error } = await supabase.rpc("complete_account_setup");
    if (error?.message === "student_id_required") {
      return { fieldErrors: {}, message: STUDENT_ID_MISSING_MESSAGE };
    }
    if (error) throw error;
  } catch (error) {
    console.error("Account setup failed", error);
    return { fieldErrors: {}, message: SAVE_FAILED_MESSAGE };
  }

  redirect(ROLE_HOME_PATHS[account.role]);
}
