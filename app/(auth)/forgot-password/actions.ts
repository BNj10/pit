"use server";

import { redirect } from "next/navigation";

import { forgotPasswordSchema } from "@/lib/auth-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Emails a password-reset link (see supabase/templates/recovery.html). Always shows
 * the same confirmation so the form never reveals which emails have accounts.
 */
export async function requestPasswordReset(formData: FormData): Promise<{ error: string }> {
  const input = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.data.email);
  if (error) console.error("Password reset email failed", error.code ?? error.message);

  redirect("/request-sent");
}
