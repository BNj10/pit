import type { ComponentProps } from "react";

export type PasswordFieldProps = Omit<
  ComponentProps<"input">,
  "type" | "className" | "aria-invalid"
> & {
  label?: string;
  invalid?: boolean;
  error?: string;
  errorMessageId?: string;
};

export type NewPasswordErrors = Partial<
  Record<"password" | "confirmPassword", string>
>;

/** Portal roles stored in `public.profiles.role` (see ADR 0001). */
export const ACCOUNT_ROLES = ["student", "department-chair", "dean"] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

/** The signed-in user's account, resolved on the server from the session and `public.profiles`. */
export interface CurrentAccount {
  userId: string;
  email: string | null;
  role: AccountRole;
  /** Students set it once with set_student_id(); null until then and for other roles. */
  studentId: string | null;
  /** False until an invited user has chosen a password (and, for students, a student ID). */
  setupComplete: boolean;
}

/** Field and form errors returned by the account setup and new-password Server Actions. */
export interface AccountFormFailure {
  fieldErrors: Partial<Record<"studentId" | "password" | "confirmPassword", string>>;
  message?: string;
}

/** Returned by the login Server Action when sign-in fails; success redirects instead. */
export interface LoginFailure {
  message: string;
}
