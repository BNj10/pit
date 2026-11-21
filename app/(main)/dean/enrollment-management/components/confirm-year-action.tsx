"use client";

import { useRef, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * A confirmed academic year action. When `blockedReason` is set the dialog only
 * explains why the action isn't available yet. `onDone` moves focus after a
 * confirmed action, because the row's actions change.
 */
export function ConfirmYearAction({ trigger, label, title, description, confirmLabel, blockedReason, onConfirm, onDone }: {
  trigger: ReactNode;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  blockedReason?: string | null;
  onConfirm: () => void;
  onDone: () => void;
}) {
  const confirmed = useRef(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" aria-label={label} className="dean-enrollment-row-action">
          {trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onCloseAutoFocus={(event) => {
        if (!confirmed.current) return;
        confirmed.current = false;
        event.preventDefault();
        onDone();
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{blockedReason ?? description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blockedReason ? (
            <AlertDialogCancel>OK</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  confirmed.current = true;
                  onConfirm();
                }}
              >
                {confirmLabel}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
