import Link from "next/link";
import { MailCheck, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResetRequestSent() {
  return (
    <section
      aria-labelledby="reset-request-sent-heading"
      className="flex w-full max-w-[420px] flex-col items-center gap-6 text-center"
    >
      <div className="flex size-18 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <MailCheck aria-hidden="true" className="size-8" />
      </div>

      <header className="w-full space-y-3">
        <h1
          id="reset-request-sent-heading"
          className="text-[32px] leading-tight font-semibold tracking-[-0.7px]"
        >
          Check your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If an account matches your details, we’ll send a password reset link to
          its registered email address.
        </p>
      </header>

      <Button
        asChild
        className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        <Link href="/login">Back to login</Link>
      </Button>

      <Link
        href="/forgot-password"
        className="relative inline-flex items-center justify-center gap-2 rounded-sm py-1 text-[13px] leading-4 font-medium text-primary underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-2.5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <RotateCcw aria-hidden="true" className="size-[15px]" />
        Request a new link
      </Link>
    </section>
  );
}
