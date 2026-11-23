export const LOGIN_ERROR_MESSAGE = "Invalid login credentials.";

export const LOGIN_UNAVAILABLE_MESSAGE =
  "Unable to log in right now. Please try again.";

export const NO_PORTAL_ACCOUNT_MESSAGE =
  "This account has no portal access yet. Contact the registrar’s office.";

export const SAVE_FAILED_MESSAGE = "Unable to save right now. Please try again.";

/** Errors that auth routes report to /login through `?error=`. */
export const LOGIN_PAGE_ERRORS = {
  "no-account": NO_PORTAL_ACCOUNT_MESSAGE,
  failed: "Unable to log in with Google. Please try again.",
  "link-expired":
    "This link has expired or was already used. Request a new password reset, or ask the registrar’s office for a new invite.",
} as const;

export type LoginPageError = keyof typeof LOGIN_PAGE_ERRORS;

export function getLoginErrorMessage(code: unknown) {
  return typeof code === "string" && Object.hasOwn(LOGIN_PAGE_ERRORS, code)
    ? LOGIN_PAGE_ERRORS[code as LoginPageError]
    : undefined;
}

/** Errors raised by set_student_id() and complete_account_setup(), keyed by their message. */
export const STUDENT_ID_ERRORS: Partial<Record<string, string>> = {
  student_id_taken:
    "That student ID is already registered. Check it, or contact the registrar’s office.",
  student_id_invalid: "Enter your student ID in the format 00-0000-000.",
  student_id_required: "Enter your student ID.",
};
