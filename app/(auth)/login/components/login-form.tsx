"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_PATTERN, STUDENT_ID_PATTERN } from "@/lib/auth-validation";

import { PasswordField } from "./password-field";

const LOGIN_ERROR_MESSAGE = "Invalid login credentials.";

type FieldErrors = {
  identifier: boolean;
  password: boolean;
};

export function LoginForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const toastId = useId();
  const toastMessageId = `${toastId}-message`;
  const [isValidationToastVisible, setIsValidationToastVisible] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    identifier: false,
    password: false,
  });

  useEffect(() => {
    function blurInputOutside(event: PointerEvent) {
      const input = document.activeElement;

      if (
        input instanceof HTMLInputElement &&
        formRef.current?.contains(input) &&
        (input.name === "identifier" || input.name === "password") &&
        event.target instanceof Node &&
        !input.contains(event.target)
      ) {
        input.blur();
      }
    }

    document.addEventListener("pointerdown", blurInputOutside, true);
    return () => {
      document.removeEventListener("pointerdown", blurInputOutside, true);
      toast.dismiss(toastId);
    };
  }, [toastId]);

  function dismissToast() {
    setIsValidationToastVisible(false);
    toast.dismiss(toastId);
  }

  function showErrorToast() {
    setIsValidationToastVisible(true);
    toast.custom(
      () => (
        <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 font-sans shadow-dropdown">
          <CircleAlert
            aria-hidden="true"
            className="size-5 shrink-0 text-destructive"
          />
          <p
            id={toastMessageId}
            className="min-w-0 flex-1 text-sm leading-body font-medium text-destructive"
          >
            {LOGIN_ERROR_MESSAGE}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Dismiss error"
            onClick={dismissToast}
            className="relative size-8 rounded-md text-muted-foreground after:absolute after:-inset-1.5"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ),
      {
        id: toastId,
        duration: 5_000,
        className: "w-full",
        onDismiss: () => setIsValidationToastVisible(false),
        onAutoClose: () => setIsValidationToastVisible(false),
      },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const nextErrors: FieldErrors = {
      identifier:
        !EMAIL_PATTERN.test(identifier) && !STUDENT_ID_PATTERN.test(identifier),
      password: !String(formData.get("password") ?? ""),
    };

    setErrors(nextErrors);

    if (nextErrors.identifier || nextErrors.password) {
      showErrorToast();
      const field = form.elements.namedItem(
        nextErrors.identifier ? "identifier" : "password",
      );
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }

    dismissToast();
  }

  return (
    <form
      ref={formRef}
      aria-labelledby="login-heading"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full max-w-[420px] flex-col gap-6"
    >
      <header className="space-y-2.5">
        <h1
          id="login-heading"
          className="text-[32px] leading-[39px] font-semibold tracking-[-0.7px]"
        >
          Welcome back
        </h1>
        <p className="text-sm leading-[17px] text-muted-foreground">
          Log in to your university account to continue.
        </p>
      </header>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full gap-2.5 rounded-md bg-card text-sm font-medium"
      >
        <Image
          src="/icons8-google-48.png"
          alt=""
          width={25}
          height={25}
          className="size-[25px]"
        />
        Continue with Google
      </Button>

      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-xs leading-[15px] text-muted-foreground">
          or log in with your account
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="identifier" className="text-[13px] leading-4 font-medium">
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
          aria-invalid={errors.identifier}
          aria-describedby={
            errors.identifier && isValidationToastVisible ? toastMessageId : undefined
          }
          className="h-12 rounded-md border-border bg-card px-3.5 text-base aria-invalid:ring-0 focus-visible:aria-invalid:ring-3 md:text-sm"
        />
      </div>

      <PasswordField
        invalid={errors.password}
        errorMessageId={isValidationToastVisible ? toastMessageId : undefined}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            name="rememberMe"
            className="rounded-[3px] border-border-strong"
          />
          <Label
            htmlFor="remember-me"
            className="relative cursor-pointer text-[13px] leading-4 font-normal text-muted-foreground after:absolute after:inset-x-0 after:-inset-y-3.5"
          >
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="relative inline-flex items-center rounded-sm text-[13px] leading-4 font-medium text-primary underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-3.5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        Log in
      </Button>

      <p className="text-center text-xs leading-[15px] text-muted-foreground">
        Need access? Contact the registrar’s office.
      </p>
    </form>
  );
}
