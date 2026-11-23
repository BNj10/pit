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
