"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LOGIN_PATH } from "./routes";

export async function logout() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error("Unable to sign out.");

  redirect(LOGIN_PATH);
}
