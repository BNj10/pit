"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { CircleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LOGIN_PAGE_ERRORS,
  LOGIN_ERROR_MESSAGE,
  LOGIN_UNAVAILABLE_MESSAGE,
} from "@/lib/auth/messages";
import { EMAIL_PATTERN, STUDENT_ID_PATTERN } from "@/lib/auth-validation";

import type { GoogleLoginResult, LoginFailure } from "@/types/auth-types";

import { PasswordField } from "../../components/password-field";
import { login, loginWithGoogle } from "../actions";

type FieldErrors = {
  identifier: boolean;
  password: boolean;
};

interface LoginFormProps {
  /** Error reported by the Google sign-in callback, shown once on load. */
  initialError?: string;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const toastId = useId();
  const toastMessageId = `${toastId}-message`;
  const [isValidationToastVisible, setIsValidationToastVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGoogleStarting, startGoogleTransition] = useTransition();
  const [isLeavingForGoogle, setIsLeavingForGoogle] = useState(false);
  const isGooglePending = isGoogleStarting || isLeavingForGoogle;
  const isBusy = isPending || isGooglePending;
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

    // Pressing Back from Google can restore this page from the browser cache.
    function resetAfterBack(event: PageTransitionEvent) {
      if (event.persisted) setIsLeavingForGoogle(false);
    }

    document.addEventListener("pointerdown", blurInputOutside, true);
    window.addEventListener("pageshow", resetAfterBack);
    return () => {
      document.removeEventListener("pointerdown", blurInputOutside, true);
      window.removeEventListener("pageshow", resetAfterBack);
      toast.dismiss(toastId);
    };
  }, [toastId]);

  function dismissToast() {
    setIsValidationToastVisible(false);
    toast.dismiss(toastId);
  }

  function showErrorToast(message = LOGIN_ERROR_MESSAGE) {
    setIsValidationToastVisible(true);
    renderErrorToast(message);
  }

  function renderErrorToast(message: string) {
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
            {message}
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

  const showInitialError = useEffectEvent(() => {
    if (!initialError) return;
    renderErrorToast(initialError);
    // Drop ?error= so a refresh does not repeat the message.
    window.history.replaceState(null, "", window.location.pathname);
  });

  useEffect(() => {
    showInitialError();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

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
    startTransition(async () => {
      let failure: LoginFailure;
      try {
        failure = await login(formData);
      } catch (error) {
        // A successful login redirects, which rejects the call with Next.js's
        // redirect error; let Next.js handle it instead of reporting a failure.
        unstable_rethrow(error);
        failure = { message: LOGIN_UNAVAILABLE_MESSAGE };
      }

      // Success redirects to the portal, so only failures return here.
      const isCredentialError = failure.message === LOGIN_ERROR_MESSAGE;
      setErrors({ identifier: isCredentialError, password: isCredentialError });
      showErrorToast(failure.message);

      const password = form.elements.namedItem("password");
      if (password instanceof HTMLInputElement) {
        password.select();
        password.focus();
      }
    });
  }


  function handleGoogleLogin() {
    if (isBusy) return;

    dismissToast();
    startGoogleTransition(async () => {
      let result: GoogleLoginResult;
      try {
        result = await loginWithGoogle();
      } catch {
        result = { message: LOGIN_PAGE_ERRORS.failed };
      }

      if ("url" in result) {
        // Keep the button pending while the browser leaves for Google.
        setIsLeavingForGoogle(true);
        window.location.assign(result.url);
        return;
      }
      showErrorToast(result.message);
    });
  }

  return (
    <form
      ref={formRef}
      aria-labelledby="login-heading"
      method="post"
      noValidate
      aria-busy={isPending}
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
        disabled={isBusy}
        aria-busy={isGooglePending}
        onClick={handleGoogleLogin}
        className="h-12 w-full gap-2.5 rounded-md bg-card text-sm font-medium"
      >
        <Image
          src="/icons8-google-48.png"
          alt=""
          width={25}
          height={25}
          className="size-[25px]"
        />
        {isGooglePending ? "Redirecting to Google…" : "Continue with Google"}
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
        disabled={isBusy}
        className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        {isPending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-xs leading-[15px] text-muted-foreground">
        Need access? Contact the registrar’s office.
      </p>
    </form>
  );
}
