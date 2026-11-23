"use server";

import { redirect } from "next/navigation";

import { SAVE_FAILED_MESSAGE, STUDENT_ID_ERRORS } from "@/lib/auth/messages";
import { LOGIN_PATH, ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { getAccountEntryPath, getCurrentAccount } from "@/lib/auth/session";
import { newPasswordSchema, studentIdSchema } from "@/lib/auth-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountFormFailure } from "@/types/auth-types";

import { getPasswordFieldErrors, setPassword } from "@/lib/auth/password";

/**
 * Finishes an invited account: records the student ID (students only), sets the
 * password, then marks setup complete. Each step is safe to retry.
 */
export async function completeAccountSetup(formData: FormData): Promise<AccountFormFailure> {
  const account = await getCurrentAccount();
  if (!account) redirect(LOGIN_PATH);
  if (account.setupComplete) redirect(getAccountEntryPath(account));

  const needsStudentId = account.role === "student" && account.studentId === null;
  const studentId = needsStudentId
    ? studentIdSchema.safeParse(formData.get("studentId") ?? "")
    : null;
  const passwords = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const fieldErrors: AccountFormFailure["fieldErrors"] = {
    ...(studentId && !studentId.success
      ? { studentId: studentId.error.issues[0]?.message }
      : {}),
    ...getPasswordFieldErrors(passwords),
  };
  if (Object.keys(fieldErrors).length > 0 || !passwords.success) return { fieldErrors };

  const supabase = await createSupabaseServerClient();

  try {
    if (studentId?.success) {
      const { error } = await supabase.rpc("set_student_id", {
        new_student_id: studentId.data,
      });
      const studentIdError = error && STUDENT_ID_ERRORS[error.message];
      if (studentIdError) return { fieldErrors: { studentId: studentIdError } };
      // Already set by an earlier attempt: continue with the password.
      if (error && error.message !== "student_id_already_set") throw error;
    }

    // A retry after a student ID error may resend the same password.
    const passwordFailure = await setPassword(supabase, passwords.data.password, {
      allowSamePassword: true,
    });
    if (passwordFailure) return passwordFailure;

    const { error } = await supabase.rpc("complete_account_setup");
    if (error) {
      const message = STUDENT_ID_ERRORS[error.message];
      if (message) return { fieldErrors: { studentId: message } };
      throw error;
    }
  } catch (error) {
    console.error("Account setup failed", error);
    return { fieldErrors: {}, message: SAVE_FAILED_MESSAGE };
  }

  redirect(ROLE_HOME_PATHS[account.role]);
}
