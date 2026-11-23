import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ACCOUNT_SETUP_PATH, LOGIN_PATH, SET_NEW_PASSWORD_PATH } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Email link types this route accepts, and where each lands once verified. */
const LINK_DESTINATIONS: Partial<Record<EmailOtpType, string>> = {
  invite: ACCOUNT_SETUP_PATH,
  recovery: SET_NEW_PASSWORD_PATH,
};

/** Verifies an invite or password-reset email link and signs the user in. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const destination = type ? LINK_DESTINATIONS[type] : undefined;

  if (tokenHash && type && destination) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) return NextResponse.redirect(new URL(destination, origin));
    console.error("Email link verification failed", error.code ?? error.message);
  }

  const url = new URL(LOGIN_PATH, origin);
  url.searchParams.set("error", "link-expired");
  return NextResponse.redirect(url);
}
