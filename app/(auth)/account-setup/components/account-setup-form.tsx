"use client";

import { useState, useTransition, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logout } from "@/lib/auth/actions";
import { STUDENT_ID_PATTERN } from "@/lib/auth-validation";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/new-password-validation";
import type { AccountFormFailure, AccountRole } from "@/types/auth-types";

import { PasswordField } from "../../components/password-field";
import { completeAccountSetup } from "../actions";

type FieldErrors = AccountFormFailure["fieldErrors"];

interface AccountSetupFormProps {
  email: string | null;
  role: AccountRole;
  /** Already recorded student ID, if an earlier attempt saved it. */
  studentId: string | null;
}

const FIELD_ORDER = ["studentId", "password", "confirmPassword"] as const;

export function AccountSetupForm({ email, role, studentId }: AccountSetupFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const asksForStudentId = role === "student" && studentId === null;

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
    const enteredId = String(formData.get("studentId") ?? "").trim();
    const nextErrors: FieldErrors = {
      ...validateNewPassword(
        String(formData.get("password") ?? ""),
        String(formData.get("confirmPassword") ?? ""),
      ),
    };

    if (asksForStudentId && !enteredId) {
      nextErrors.studentId = "Enter your student ID.";
    } else if (asksForStudentId && !STUDENT_ID_PATTERN.test(enteredId)) {
      nextErrors.studentId = "Enter your student ID in the format 00-0000-000.";
    }

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
            {email ? (
              <>
                Signed in as <span className="font-medium text-foreground">{email}</span>.{" "}
              </>
            ) : null}
            {asksForStudentId
              ? "Add your student ID and choose a password to finish setting up your University Portal account."
              : "Choose a password to finish setting up your University Portal account."}
          </p>
        </header>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <fieldset disabled={isPending} className="flex min-w-0 flex-col gap-6">
          {asksForStudentId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-id" className="text-[13px] leading-4 font-medium">
                Student ID
              </Label>
              <Input
                id="student-id"
                name="studentId"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="00-0000-000"
                required
                aria-invalid={Boolean(errors.studentId)}
                aria-describedby={
                  errors.studentId ? "student-id-hint student-id-error" : "student-id-hint"
                }
                className="h-12 rounded-md border-border bg-card px-3.5 text-base aria-invalid:ring-0 focus-visible:aria-invalid:ring-3 md:text-sm"
              />
              <p id="student-id-hint" className="text-xs leading-[15px] text-muted-foreground">
                Use the ID from your registration form. Next time you can log in with it.
              </p>
              {errors.studentId && (
                <p id="student-id-error" role="alert" className="text-sm text-destructive">
                  {errors.studentId}
                </p>
              )}
            </div>
          )}

          {role === "student" && studentId !== null && (
            <p className="text-sm text-muted-foreground">
              Student ID: <span className="font-medium text-foreground">{studentId}</span>. You
              can log in with it next time.
            </p>
          )}

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
