"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ChangePasswordDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {open && (
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-lg border border-border bg-background p-0 sm:max-w-[480px] [&>[data-slot=dialog-close]]:top-[18px] [&>[data-slot=dialog-close]]:right-4 [&>[data-slot=dialog-close]]:size-11">
          <div className="flex items-center gap-3 border-b border-border p-6 pr-16">
            <LockKeyhole className="size-[22px] shrink-0 text-primary" aria-hidden="true" />
            <DialogTitle className="text-xl leading-normal font-bold">Change password</DialogTitle>
          </div>
          <div className="flex flex-col gap-5 p-6">
            <DialogDescription className="text-[13px] leading-[1.5]">Enter your current password, then choose a new one.</DialogDescription>
            <PasswordField id="account-current-password" label="Current password" placeholder="Enter current password" autoComplete="current-password" />
            <PasswordField id="account-new-password" label="New password" placeholder="Enter new password" autoComplete="new-password" />
            <PasswordField id="account-confirm-password" label="Confirm new password" placeholder="Re-enter new password" autoComplete="new-password" />
          </div>
          <div className="flex flex-wrap justify-end gap-2.5 border-t border-border px-6 py-[18px]">
            <DialogClose asChild><Button type="button" variant="outline" className="h-10 rounded-md px-4 text-xs font-semibold max-sm:h-11">Cancel</Button></DialogClose>
            <Button type="button" disabled className="h-10 rounded-md px-4 text-xs font-semibold max-sm:h-11">Update password</Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

function PasswordField({ id, label, placeholder, autoComplete }: { id: string; label: string; placeholder: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  const isNew = id === "account-new-password";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold">{label}</label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} aria-describedby={isNew ? "account-new-password-help" : undefined} className="h-11 rounded-md border-border px-3 pr-12 text-base md:text-xs" />
        <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-controls={id} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {visible ? <Eye className="size-[17px]" aria-hidden="true" /> : <EyeOff className="size-[17px]" aria-hidden="true" />}
        </button>
      </div>
      {isNew && <p id="account-new-password-help" className="text-[11px] leading-[1.4] text-muted-foreground">Use at least 12 characters. Avoid reusing a password.</p>}
    </div>
  );
}
