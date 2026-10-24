import Link from "next/link";
import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PasswordUpdated() {
  return (
    <section
      aria-labelledby="password-updated-heading"
      className="flex w-full max-w-[420px] flex-col items-center gap-6 text-center"
    >
      <div className="flex size-18 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <CircleCheck aria-hidden="true" className="size-8" />
      </div>

      <header className="w-full space-y-3">
        <h1
          id="password-updated-heading"
          className="text-[32px] leading-tight font-semibold tracking-[-0.7px]"
        >
          Password updated
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your password has been reset successfully.
          <br />
          Log in with your new password to continue.
        </p>
      </header>

      <Button
        asChild
        className="h-12 w-full rounded-md text-sm font-semibold hover:bg-primary-hover"
      >
        <Link href="/login">Back to login</Link>
      </Button>
    </section>
  );
}
