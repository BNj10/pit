import type { AccountRole } from "@/types/auth-types";

export const LOGIN_PATH = "/login";

/** Supabase sends Google sign-ins back here; it must be in the project's redirect URLs. */
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Invite and password-reset email links open this route (see supabase/templates). */
export const AUTH_CONFIRM_PATH = "/auth/confirm";

/** Invited users choose a password (and students their ID) here before using the portal. */
export const ACCOUNT_SETUP_PATH = "/account-setup";

export const SET_NEW_PASSWORD_PATH = "/set-new-password";

/** Pages that work without a session. Every other page requires sign-in. */
const PUBLIC_AUTH_PATHS = [
  LOGIN_PATH,
  AUTH_CALLBACK_PATH,
  AUTH_CONFIRM_PATH,
  "/forgot-password",
  "/request-sent",
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
