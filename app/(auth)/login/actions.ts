"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  GOOGLE_LOGIN_ERRORS,
  LOGIN_ERROR_MESSAGE,
  LOGIN_UNAVAILABLE_MESSAGE,
  NO_PORTAL_ACCOUNT_MESSAGE,
} from "@/lib/auth/messages";
import { AUTH_CALLBACK_PATH, ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { loadAccount } from "@/lib/auth/session";
import { loginSchema, STUDENT_ID_PATTERN } from "@/lib/auth-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CurrentAccount, LoginFailure } from "@/types/auth-types";

const TOO_MANY_ATTEMPTS_MESSAGE =
  "Too many login attempts. Wait a few minutes, then try again.";

/** Student IDs resolve to the account email on the server; unknown IDs return null. */
async function resolveLoginEmail(identifier: string) {
  if (!STUDENT_ID_PATTERN.test(identifier)) return identifier;

  const { data, error } = await createSupabaseAdminClient().rpc("get_login_email", {
    p_student_id: identifier,
  });

  if (error) throw error;
  return typeof data === "string" ? data : null;
}

export async function login(formData: FormData): Promise<LoginFailure> {
  const input = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!input.success) return { message: LOGIN_ERROR_MESSAGE };

  const supabase = await createSupabaseServerClient();
  let account: CurrentAccount | null;

  try {
    const email = await resolveLoginEmail(input.data.identifier);
    // Same message for unknown IDs and wrong passwords, so the form does not reveal which IDs exist.
    if (!email) return { message: LOGIN_ERROR_MESSAGE };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.data.password,
    });

    if (error?.status === 429) return { message: TOO_MANY_ATTEMPTS_MESSAGE };
    if (error?.status === 400) return { message: LOGIN_ERROR_MESSAGE };
    if (error) throw error;

    account = await loadAccount(supabase, data.user.id);
  } catch (error) {
    console.error("Login failed", error);
    await supabase.auth.signOut();
    return { message: LOGIN_UNAVAILABLE_MESSAGE };
  }

  if (!account) {
    await supabase.auth.signOut();
    return { message: NO_PORTAL_ACCOUNT_MESSAGE };
  }

  redirect(ROLE_HOME_PATHS[account.role]);
}

/** Starts Google sign-in; Supabase returns the user to the auth callback route. */
export async function loginWithGoogle(): Promise<LoginFailure> {
  // Next.js checks that a Server Action's Origin matches the host it was sent to.
  const origin = (await headers()).get("origin");
  if (!origin) return { message: GOOGLE_LOGIN_ERRORS.failed };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL(AUTH_CALLBACK_PATH, origin).toString() },
  });

  if (error || !data.url) {
    console.error("Google login failed to start", error);
    return { message: GOOGLE_LOGIN_ERRORS.failed };
  }

  redirect(data.url);
}
