"use client";

import { useState, useTransition, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { STUDENT_ID_MISSING_MESSAGE } from "@/lib/auth/messages";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/new-password-validation";
import type { AccountFormFailure } from "@/types/auth-types";

import { PasswordField } from "../../components/password-field";
import { completeAccountSetup } from "../actions";

type FieldErrors = AccountFormFailure["fieldErrors"];

interface AccountSetupFormProps {
  /** The student ID recorded before the student was invited; null for staff. */
  studentId: string | null;
  /** A student whose ID wasn't recorded; setup can't finish until it is. */
  missingStudentId: boolean;
}

const FIELD_ORDER = ["password", "confirmPassword"] as const;

export function AccountSetupForm({ studentId, missingStudentId }: AccountSetupFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(missingStudentId ? STUDENT_ID_MISSING_MESSAGE : null);
  const [isPending, startTransition] = useTransition();

  function focusFirstError(form: HTMLFormElement, fieldErrors: FieldErrors) {
    const field = FIELD_ORDER.find((name) => fieldErrors[name]);
    const input = field ? form.elements.namedItem(field) : null;
    if (input instanceof HTMLInputElement) input.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: FieldErrors = validateNewPassword(
      String(formData.get("password") ?? ""),
      String(formData.get("confirmPassword") ?? ""),
    );

    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(form, nextErrors);
      return;
    }

    startTransition(async () => {
      // Success redirects to the portal; only failures return here.
      const failure = await completeAccountSetup(formData);
      if (!failure) return;
      setErrors(failure.fieldErrors);
      setFormError(failure.message ?? null);
      focusFirstError(form, failure.fieldErrors);
    });
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-6">
      <form
        aria-labelledby="account-setup-heading"
        method="post"
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <header className="space-y-3">
          <h1
            id="account-setup-heading"
            className="text-[32px] leading-tight font-semibold tracking-[-0.7px]"
          >
            Set up your account
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {studentId
              ? "Choose a password to finish setting up your account. You can then log in with your email or student ID."
              : "Choose a password to finish setting up your account. You can then log in with your email."}
          </p>
        </header>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <fieldset disabled={isPending || missingStudentId} className="flex min-w-0 flex-col gap-6">

          <PasswordField
            id="new-password"
            name="password"
            label="New password"
            placeholder="Choose a password"
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            minLength={MIN_PASSWORD_LENGTH}
            error={errors.password}
          />
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            minLength={MIN_PASSWORD_LENGTH}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            aria-busy={isPending}
            className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
          >
            {isPending && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {isPending ? "Saving…" : "Finish setup"}
          </Button>
        </fieldset>

        <p role="status" className="sr-only">
          {isPending ? "Saving your account. Please wait." : ""}
        </p>
      </form>

      <form action={logout} className="text-center text-xs leading-[15px] text-muted-foreground">
        Not you?{" "}
        <button
          type="submit"
          className="relative rounded-sm font-medium text-primary underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
