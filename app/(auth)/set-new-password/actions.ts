"use server";

import { redirect } from "next/navigation";

import { SAVE_FAILED_MESSAGE } from "@/lib/auth/messages";
import { getPasswordFieldErrors, setPassword } from "@/lib/auth/password";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { getCurrentAccount } from "@/lib/auth/session";
import { newPasswordSchema } from "@/lib/auth-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountFormFailure } from "@/types/auth-types";

/** Saves a new password from a password-reset link, then signs the user out. */
export async function updatePassword(formData: FormData): Promise<AccountFormFailure> {
  const account = await getCurrentAccount();
  if (!account) redirect(`${LOGIN_PATH}?error=link-expired`);

  const passwords = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!passwords.success) return { fieldErrors: getPasswordFieldErrors(passwords) };

  const supabase = await createSupabaseServerClient();

  try {
    const failure = await setPassword(supabase, passwords.data.password);
    if (failure) return failure;
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Password reset failed", error);
    return { fieldErrors: {}, message: SAVE_FAILED_MESSAGE };
  }

  redirect("/password-updated");
}
