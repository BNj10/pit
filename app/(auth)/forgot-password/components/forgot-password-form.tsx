"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_PATTERN } from "@/lib/auth-validation";

import { requestPasswordReset } from "../actions";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    let nextError: string | null = null;

    if (!email) {
      nextError = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextError = "Please enter a valid email address (e.g. name@example.com).";
    }

    setError(nextError);

    if (nextError) {
      const input = form.elements.namedItem("email");
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }

    startTransition(async () => {
      // Success redirects to /request-sent; only validation errors return here.
      const result = await requestPasswordReset(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form
      aria-labelledby="forgot-password-heading"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full max-w-[420px] flex-col gap-6"
    >
      <Link
        href="/login"
        className="-my-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm py-3 text-[13px] font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to login
      </Link>

      <header className="space-y-3">
        <h1
          id="forgot-password-heading"
          className="text-[32px] leading-heading font-semibold tracking-heading"
        >
          Forgot password?
        </h1>
        <p
          id="recovery-instructions"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          Enter the email address linked to your account. We’ll send password
          reset instructions to that email.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="recovery-email" className="text-[13px] font-medium">
          Email
        </Label>
        <Input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? "recovery-instructions recovery-email-error"
              : "recovery-instructions"
          }
          placeholder="Enter your email address"
          required
          className="h-12 rounded-md border-border bg-card px-3.5 text-base aria-invalid:ring-0 focus-visible:aria-invalid:ring-3 md:text-sm"
        />
        {error && (
          <p
            id="recovery-email-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="h-12 w-full gap-2.5 rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        {isPending && (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        )}
        {isPending ? "Sending…" : "Send reset instructions"}
      </Button>
    </form>
  );
}
