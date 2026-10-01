"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordField } from "./password-field";

const SIGN_IN_UNAVAILABLE =
  "Sign-in is currently unavailable. Please contact the registrar’s office for assistance.";

export function LoginForm() {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(SIGN_IN_UNAVAILABLE);
  }

  return (
    <form
      aria-labelledby="login-heading"
      method="post"
      onSubmit={handleSubmit}
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
          className="h-12 rounded-md bg-card px-3.5 text-base md:text-base"
        />
      </div>

      <PasswordField />

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
