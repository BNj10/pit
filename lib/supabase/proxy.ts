import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

/**
 * Refreshes the Supabase session cookies for this request. `isSignedIn` is an
 * optimistic check for redirects only; pages and actions must verify the session
 * themselves before reading or changing data.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not run code between creating the client and getClaims(); it refreshes the session.
  const { data } = await supabase.auth.getClaims();

  return { response, isSignedIn: Boolean(data?.claims.sub) };
}

/** Redirects while keeping any session cookies and cache headers set during the refresh. */
export function redirectWithSession(response: NextResponse, destination: URL) {
  const redirect = NextResponse.redirect(destination);

  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  });

  return redirect;
}
