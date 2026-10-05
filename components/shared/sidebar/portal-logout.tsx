"use client";

import { useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface PortalLogoutProps {
  label: string;
  onLogout?: () => void | Promise<void>;
}

export function PortalLogout({ label, onLogout }: PortalLogoutProps) {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (inFlight.current) return;

    if (!onLogout) {
      toast.error("Unable to sign out. Please try again.");
      return;
    }

    inFlight.current = true;
    setPending(true);
    try {
      await onLogout();
    } catch {
      toast.error("Unable to sign out. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={handleLogout}
      className={cn(
        "flex h-[42px] w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] leading-4 font-semibold text-sidebar-foreground outline-sidebar-ring",
        "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:opacity-50",
      )}
    >
      <LogOut aria-hidden="true" className="size-[18px] shrink-0 text-sidebar-icon" />
      <span>{pending ? "Signing out…" : label}</span>
    </button>
  );
}
