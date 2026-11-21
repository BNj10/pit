"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validatePasswordChange, type PasswordChangeValues } from "@/lib/account-validation";

const passwordFields = [
  { name: "currentPassword", label: "Current password", placeholder: "Enter current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", placeholder: "Enter new password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", placeholder: "Re-enter new password", autoComplete: "new-password" },
] as const;

function PasswordForm() {
  const [visible, setVisible] = useState<Partial<Record<keyof PasswordChangeValues, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordChangeValues, string>>>({});
  const [serviceError, setServiceError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const nextErrors = validatePasswordChange({
      currentPassword: String(values.get("currentPassword") ?? ""),
      newPassword: String(values.get("newPassword") ?? ""),
      confirmPassword: String(values.get("confirmPassword") ?? ""),
    });
    setErrors(nextErrors);
    setServiceError("");
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      const input = form.elements.namedItem(firstInvalid);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    // No authentication service is connected to this design preview. Never
    // simulate success, retain credentials, or mutate an unverified account.
    form.reset();
    setVisible({});
    setServiceError("Password changes are currently unavailable. Please contact your administrator.");
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="account-password-body">
        <DialogDescription>Enter your current password, then choose a new one.</DialogDescription>
        {passwordFields.map((field) => (
          <div className="account-password-field" key={field.name}>
            <label htmlFor={`account-${field.name}`}>{field.label}</label>
            <div className="account-password-input">
              <Input
                id={`account-${field.name}`}
                name={field.name}
                type={visible[field.name] ? "text" : "password"}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required
                minLength={field.name === "newPassword" ? 12 : undefined}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={[
                  field.name === "newPassword" ? "account-password-help" : "",
                  errors[field.name] ? `account-${field.name}-error` : "",
                ].filter(Boolean).join(" ") || undefined}
                onChange={() => {
                  setErrors((current) => ({ ...current, [field.name]: undefined }));
                  setServiceError("");
                }}
              />
              <button
                type="button"
                aria-label={`${visible[field.name] ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                aria-pressed={Boolean(visible[field.name])}
                onClick={() => setVisible((current) => ({ ...current, [field.name]: !current[field.name] }))}
              >
                {visible[field.name] ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
              </button>
            </div>
            {field.name === "newPassword" && <p className="field-help" id="account-password-help">Use at least 12 characters. Avoid reusing a password.</p>}
            {errors[field.name] && <p className="field-error" id={`account-${field.name}-error`} role="alert">{errors[field.name]}</p>}
          </div>
        ))}
        {serviceError && <p className="field-error" role="alert">{serviceError}</p>}
      </div>
      <DialogFooter className="account-password-footer">
        <DialogClose asChild><Button type="button" variant="outline" className="account-button">Cancel</Button></DialogClose>
        <Button type="submit" className="account-button">Update password</Button>
      </DialogFooter>
    </form>
  );
}

export function ChangePasswordDialog({ disabled = false }: { disabled?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="account-button account-security-button" disabled={disabled}><KeyRound aria-hidden="true" />Change password</Button>
      </DialogTrigger>
      <DialogContent className="account-password-dialog">
        <DialogHeader className="account-password-header">
          <DialogTitle><LockKeyhole aria-hidden="true" />Change password</DialogTitle>
        </DialogHeader>
        <PasswordForm />
      </DialogContent>
    </Dialog>
  );
}
