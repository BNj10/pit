"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_PATTERN, STUDENT_ID_PATTERN } from "@/lib/auth-validation";

import { PasswordField } from "./password-field";

const SIGN_IN_UNAVAILABLE =
  "Sign-in is currently unavailable. Please contact the registrar’s office for assistance.";

type FieldErrors = {
  identifier?: string;
  password?: string;
};

export function LoginForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  function clearError(field: keyof FieldErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const identifierInput = form.elements.namedItem(
      "identifier",
    ) as HTMLInputElement;
    const nextErrors: FieldErrors = {};

    if (!identifier) {
      nextErrors.identifier = "Please enter your email or student ID.";
    } else if (
      !EMAIL_PATTERN.test(identifier) &&
      !STUDENT_ID_PATTERN.test(identifier)
    ) {
      nextErrors.identifier = /^[\d-]+$/.test(identifier)
        ? "Please enter your student ID in the format 23-0646-345 (2 digits, 4 digits, then 3 digits)."
        : "Please enter a valid email address (e.g. name@example.com) or a student ID in the format 23-0646-345.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);

    if (nextErrors.identifier || nextErrors.password) {
      const field = nextErrors.identifier
        ? identifierInput
        : form.elements.namedItem("password");
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }

    setNotice(SIGN_IN_UNAVAILABLE);
  }

  return (
    <form
      aria-labelledby="login-heading"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      onChange={(event) => {
        if (event.target instanceof HTMLInputElement) {
          const field = event.target.name;
          if (field === "identifier" || field === "password") clearError(field);
        }
      }}
      className="flex w-full max-w-[420px] flex-col gap-6"
    >
      <header className="mb-2 space-y-3">
        <h1
          id="login-heading"
          className="text-3xl leading-heading font-semibold tracking-heading sm:text-4xl"
        >
          Welcome back
        </h1>
        <p className="text-sm leading-body text-muted-foreground">
          Log in to your PIT account to continue.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-sm font-medium">
          Email or ID number
        </Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Enter your email or ID number"
          required
          aria-invalid={Boolean(errors.identifier)}
          aria-describedby={
            errors.identifier
              ? "identifier-hint identifier-error"
              : "identifier-hint"
          }
          className="h-12 rounded-md bg-card px-3.5 text-base md:text-base"
        />
        {errors.identifier && (
          <p id="identifier-error" role="alert" className="text-sm text-destructive">
            {errors.identifier}
          </p>
        )}
      </div>

      <PasswordField error={errors.password} />

      <div className="-my-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            name="rememberMe"
            className="rounded-sm"
          />
          <Label
            htmlFor="remember-me"
            className="flex min-h-11 cursor-pointer items-center text-sm font-normal text-muted-foreground"
          >
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Forgot password?
        </Link>
      </div>

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
        Log in
      </Button>

      <p className="text-center text-sm leading-body text-muted-foreground">
        Need access? Contact the registrar’s office.
      </p>
    </form>
  );
}
