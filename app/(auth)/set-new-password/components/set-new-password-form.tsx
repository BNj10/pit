"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/lib/new-password-validation";
import type { NewPasswordErrors } from "@/types/auth-types";

import { PasswordField } from "../../components/password-field";

export function SetNewPasswordForm() {
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validateNewPassword(
      String(formData.get("password") ?? ""),
      String(formData.get("confirmPassword") ?? ""),
    );

    setErrors(nextErrors);

    if (nextErrors.password || nextErrors.confirmPassword) {
      const input = form.elements.namedItem(
        nextErrors.password ? "password" : "confirmPassword",
      );
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }

    setNotice(
      "Password setup is currently unavailable. Please contact the registrar’s office for assistance.",
    );
  }

  return (
    <form
      aria-labelledby="set-new-password-heading"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      onChange={() => setNotice(null)}
      className="flex w-full max-w-[420px] flex-col gap-6"
    >
      <Link
        href="/login"
        className="-my-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm py-3 text-[13px] leading-4 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to login
      </Link>

      <header className="space-y-3">
        <h1
          id="set-new-password-heading"
          className="text-[32px] leading-tight font-semibold tracking-[-0.7px]"
        >
          Set a new password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose a new password for your University Portal account. Enter it
          again to confirm.
        </p>
      </header>

      <PasswordField
        id="new-password"
        name="password"
        label="New password"
        placeholder="Enter your new password"
        autoComplete="new-password"
        autoCapitalize="none"
        spellCheck={false}
        minLength={MIN_PASSWORD_LENGTH}
        aria-describedby="password-match-guidance"
        error={errors.password}
      />
      <PasswordField
        id="confirm-password"
        name="confirmPassword"
        label="Confirm new password"
        placeholder="Re-enter your new password"
        autoComplete="new-password"
        autoCapitalize="none"
        spellCheck={false}
        minLength={MIN_PASSWORD_LENGTH}
        aria-describedby="password-match-guidance"
        error={errors.confirmPassword}
      />
      
      {notice && (
        <p
          role="status"
          className="rounded-md border border-info-border bg-info-soft p-3 text-sm leading-body text-info"
        >
          {notice}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        Reset password
      </Button>
    </form>
  );
}
