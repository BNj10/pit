import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import * as z from "zod";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACCOUNT_ROLES, type AccountRole, type CurrentAccount } from "@/types/auth-types";

import { LOGIN_PATH, ROLE_HOME_PATHS } from "./routes";

const profileSchema = z.object({
  role: z.enum(ACCOUNT_ROLES),
  student_id: z.string().nullable(),
});

/** Loads a user's portal account with a session-aware client; RLS limits it to the user's own profile. */
export async function loadAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<CurrentAccount | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, student_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the account profile.");
  if (!profile) return null;

  const { role, student_id: studentId } = profileSchema.parse(profile);
  return { userId, role, studentId };
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

  return loadAccount(supabase, userId);
});

/** Use at the top of each portal's server code. Sends other roles to their own portal. */
export async function requireRole(role: AccountRole) {
  const account = await getCurrentAccount();

  if (!account) redirect(LOGIN_PATH);
  if (account.role !== role) redirect(ROLE_HOME_PATHS[account.role]);

  return account;
}
