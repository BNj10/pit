"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordField({
  invalid = false,
  errorMessageId,
}: {
  invalid?: boolean;
  errorMessageId?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="password" className="text-[13px] leading-4 font-medium">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          aria-invalid={invalid}
          aria-describedby={invalid ? errorMessageId : undefined}
          className="h-12 rounded-md border-border bg-card pr-14 pl-3.5 text-base aria-invalid:ring-0 focus-visible:aria-invalid:ring-3 md:text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls="password"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-0.5 right-px size-11 rounded-sm text-muted-foreground hover:bg-muted [&_svg]:size-[18px]"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}
