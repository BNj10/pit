"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LeaveEvaluationDialogProps {
  onDiscard: () => void;
}

export function LeaveEvaluationDialog({ onDiscard }: LeaveEvaluationDialogProps) {
  const router = useRouter();
  const [destination, setDestination] = useState<string | null>(null);
  const keepEvaluatingRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    function confirmLinkNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDestination(`${url.pathname}${url.search}${url.hash}`);
    }

    function confirmDocumentNavigation(event: BeforeUnloadEvent) {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    document.addEventListener("click", confirmLinkNavigation, true);
    window.addEventListener("beforeunload", confirmDocumentNavigation);
    return () => {
      document.removeEventListener("click", confirmLinkNavigation, true);
      window.removeEventListener("beforeunload", confirmDocumentNavigation);
    };
  }, []);

  function leaveEvaluation() {
    if (destination === null) return;
    leavingRef.current = true;
    onDiscard();
    router.push(destination);
  }

  return (
    <AlertDialog open={destination !== null} onOpenChange={(open) => { if (!open) setDestination(null); }}>
      <AlertDialogContent
        className="w-[calc(100%-2rem)] gap-[18px] rounded-xl border border-border bg-background p-6 text-foreground ring-0 shadow-[0_8px_24px_color-mix(in_srgb,var(--foreground)_9%,transparent)] data-[size=default]:max-w-[600px] data-[size=default]:sm:max-w-[600px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          keepEvaluatingRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (leavingRef.current) {
            event.preventDefault();
          } else if (returnFocusRef.current?.isConnected && returnFocusRef.current.getClientRects().length > 0) {
            event.preventDefault();
            returnFocusRef.current.focus({ preventScroll: true });
          }
        }}
      >
        <AlertDialogTitle className="pr-8 text-[21px] leading-[1.3] font-bold">Leave this evaluation?</AlertDialogTitle>
        <AlertDialogCancel
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-[18px] right-[18px] rounded-md text-muted-foreground"
          aria-label="Close and keep evaluating"
        >
          <X className="size-[18px]" aria-hidden="true" />
        </AlertDialogCancel>
        <AlertDialogDescription className="text-[13px] leading-[1.5] text-pretty">
          Your evaluation progress will not be saved if you leave this page. Any ratings and comments you have entered will be lost.
        </AlertDialogDescription>
        <div className="flex flex-wrap justify-end gap-2.5">
          <AlertDialogAction type="button" variant="outline" className="h-10 rounded-md px-4 text-xs font-semibold" onClick={leaveEvaluation}>
            Leave page
          </AlertDialogAction>
          <AlertDialogCancel ref={keepEvaluatingRef} type="button" variant="default" className="h-10 rounded-md px-4 text-xs font-semibold">
            Keep evaluating
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
