"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordField({ error }: { error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-medium">
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
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          className="h-12 rounded-md bg-card pr-14 pl-3.5 text-base md:text-base"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls="password"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-0.5 right-0.5 size-11 rounded-sm text-muted-foreground hover:bg-muted [&_svg]:size-5"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id="password-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
