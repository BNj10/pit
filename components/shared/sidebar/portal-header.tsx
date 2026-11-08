"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Bell, Menu } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

export function PortalHeader({ children }: { children: ReactNode }) {
  const { openMobile, setOpenMobile, mobileTriggerRef } = useSidebar();

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card px-4 py-2 md:min-h-[72px] md:px-6 lg:flex-nowrap lg:gap-4 lg:px-8 lg:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-3 lg:hidden">
        <button
          ref={mobileTriggerRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={openMobile}
          aria-controls="portal-navigation"
          aria-haspopup="dialog"
          onClick={() => setOpenMobile(true)}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu aria-hidden="true" className="size-6" />
        </button>
        <Image
          src="/images-removebg-preview.png"
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 object-contain"
        />
        <span className="min-w-0 flex-1 text-sm font-bold text-primary md:text-base">
          University Portal
        </span>
      </div>
      <div className="order-last w-full min-w-0 lg:order-none lg:flex lg:w-auto lg:flex-1 lg:items-center lg:gap-4">
        {children}
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell aria-hidden="true" className="size-5" />
      </button>
    </header>
  );
}
