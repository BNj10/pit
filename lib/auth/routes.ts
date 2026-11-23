import type { AccountRole } from "@/types/auth-types";

export const LOGIN_PATH = "/login";

/** Supabase sends Google sign-ins back here; it must be in the project's redirect URLs. */
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Pages that work without a session. Every other page requires sign-in. */
const PUBLIC_AUTH_PATHS = [
  LOGIN_PATH,
  AUTH_CALLBACK_PATH,
  "/forgot-password",
  "/request-sent",
  "/set-new-password",
  "/password-updated",
] as const;

/** Where each role lands after sign-in. */
export const ROLE_HOME_PATHS = {
  student: "/student",
  "department-chair": "/department-chair",
  dean: "/dean",
} as const satisfies Record<AccountRole, string>;

export function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
