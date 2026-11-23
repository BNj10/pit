export const LOGIN_ERROR_MESSAGE = "Invalid login credentials.";

export const LOGIN_UNAVAILABLE_MESSAGE =
  "Unable to log in right now. Please try again.";

export const NO_PORTAL_ACCOUNT_MESSAGE =
  "This account has no portal access yet. Contact the registrar’s office.";

/** Errors the Google sign-in callback reports to /login through `?error=`. */
export const GOOGLE_LOGIN_ERRORS = {
  "no-account": NO_PORTAL_ACCOUNT_MESSAGE,
  failed: "Unable to log in with Google. Please try again.",
} as const;

export type GoogleLoginError = keyof typeof GOOGLE_LOGIN_ERRORS;

export function getGoogleLoginErrorMessage(code: unknown) {
  return typeof code === "string" && Object.hasOwn(GOOGLE_LOGIN_ERRORS, code)
    ? GOOGLE_LOGIN_ERRORS[code as GoogleLoginError]
    : undefined;
}
