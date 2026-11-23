import type { NextRequest } from "next/server";

import { isPublicAuthPath, LOGIN_PATH } from "@/lib/auth/routes";
import { redirectWithSession, updateSession } from "@/lib/supabase/proxy";

// Optimistic check only: it refreshes the session and sends signed-out visitors to
// the login page. Pages, Server Actions, and Route Handlers verify the session and
// role themselves (see lib/auth/session.ts).
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);

  if (!isSignedIn && !isPublicAuthPath(request.nextUrl.pathname)) {
    return redirectWithSession(response, new URL(LOGIN_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
