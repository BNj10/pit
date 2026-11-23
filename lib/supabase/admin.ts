import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

/**
 * Bypasses Row Level Security. Use only for narrow server tasks that no signed-in
 * user can do for themselves, such as resolving a student ID before sign-in.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY. Copy the Secret key into .env.local.");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
