"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PasswordFieldProps } from "@/types/auth-types";

export function PasswordField({
  id = "password",
  name = id,
  label = "Password",
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = true,
  invalid = false,
  error,
  errorMessageId,
  "aria-describedby": descriptionId,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const isInvalid = invalid || Boolean(error);
  const fieldErrorId = error ? `${id}-error` : errorMessageId;
  const describedBy =
    [descriptionId, isInvalid ? fieldErrorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-[13px] leading-4 font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className="h-12 rounded-md border-border bg-card pr-14 pl-3.5 text-base aria-invalid:ring-0 focus-visible:aria-invalid:ring-3 md:text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-0.5 right-px size-11 rounded-sm text-muted-foreground hover:bg-muted [&_svg]:size-[18px]"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id={fieldErrorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
