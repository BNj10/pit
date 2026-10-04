"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSWORD_RECOVERY_UNAVAILABLE =
  "Password recovery is currently unavailable. Please contact the registrar’s office for assistance.";

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(PASSWORD_RECOVERY_UNAVAILABLE);
  }

  return (
    <form
      aria-labelledby="forgot-password-heading"
      method="post"
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
          Enter your email or student ID. We’ll send password reset instructions
          to the email linked to your account.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="recovery-identifier" className="text-[13px] font-medium">
          Email or student ID
        </Label>
        <Input
          id="recovery-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby="recovery-instructions"
          placeholder="Enter your email or student ID"
          required
          pattern=".*\S.*"
          onChange={() => setNotice(null)}
          className="h-12 rounded-md border-border bg-card px-3.5 text-base md:text-sm"
        />
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
        className="h-12 w-full gap-2.5 rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        Send reset instructions
        <ArrowRight aria-hidden="true" className="size-[17px]" />
      </Button>
    </form>
  );
}
