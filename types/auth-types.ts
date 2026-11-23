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
  role: AccountRole;
  /** Present only for students; assigned by the Administrator. */
  studentId: string | null;
}

/** Returned by the login Server Action when sign-in fails; success redirects instead. */
export interface LoginFailure {
  message: string;
}
