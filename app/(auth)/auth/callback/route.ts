import { NextResponse, type NextRequest } from "next/server";

import type { LoginPageError } from "@/lib/auth/messages";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { getAccountEntryPath, loadAccount } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectToLogin(request: NextRequest, error: LoginPageError) {
  const url = new URL(LOGIN_PATH, request.nextUrl.origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

/** Finishes Google sign-in: exchanges Supabase's code for a session, then opens the portal. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  // Sign-up is disabled, so a Google account without a PIT Enroll account is refused here.
  if (searchParams.get("error_code") === "signup_disabled") {
    return redirectToLogin(request, "no-account");
  }
  if (!code) return redirectToLogin(request, "failed");

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    const account = await loadAccount(supabase, data.user);
    if (!account) {
      await supabase.auth.signOut();
      return redirectToLogin(request, "no-account");
    }

    return NextResponse.redirect(
      new URL(getAccountEntryPath(account), request.nextUrl.origin),
    );
  } catch (error) {
    console.error("Google login failed", error);
    await supabase.auth.signOut();
    return redirectToLogin(request, "failed");
  }
}
