import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import * as z from "zod";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACCOUNT_ROLES, type AccountRole, type CurrentAccount } from "@/types/auth-types";

import { ACCOUNT_SETUP_PATH, LOGIN_PATH, ROLE_HOME_PATHS } from "./routes";

const profileSchema = z.object({
  role: z.enum(ACCOUNT_ROLES),
  student_id: z.string().nullable(),
  account_setup_completed_at: z.string().nullable(),
});

/** Loads a user's portal account with a session-aware client; RLS limits it to the user's own profile. */
export async function loadAccount(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
): Promise<CurrentAccount | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, student_id, account_setup_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error("Unable to load the account profile.");
  if (!profile) return null;

  const parsed = profileSchema.parse(profile);
  return {
    userId: user.id,
    email: user.email ?? null,
    role: parsed.role,
    studentId: parsed.student_id,
    setupComplete: parsed.account_setup_completed_at !== null,
  };
}

/** Students are invited with their ID already recorded; setup can't finish without it. */
export function isMissingStudentId(account: CurrentAccount) {
  return account.role === "student" && account.studentId === null;
}

/** Where a signed-in account should go: account setup first, then its portal. */
export function getAccountEntryPath(account: CurrentAccount) {
  return account.setupComplete ? ROLE_HOME_PATHS[account.role] : ACCOUNT_SETUP_PATH;
}

/**
 * Verifies the session and loads the signed-in user's account. Returns null when
 * there is no valid session or no profile. Memoized for one render pass.
 */
export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (error || !userId) return null;

  return loadAccount(supabase, { id: userId, email: data.claims.email });
});

/**
 * Use at the top of each portal's server code. Sends unfinished accounts to setup
 * and other roles to their own portal.
 */
export async function requireRole(role: AccountRole) {
  const account = await getCurrentAccount();

  if (!account) redirect(LOGIN_PATH);
  if (!account.setupComplete || account.role !== role) {
    redirect(getAccountEntryPath(account));
  }

  return account;
}
