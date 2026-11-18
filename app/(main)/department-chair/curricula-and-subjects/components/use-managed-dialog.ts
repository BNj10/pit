"use client";

import { useEffect, useRef, useState } from "react";

/** Focuses the element, or the fallback when the element has left the page. */
export function focusById(id: string, fallbackId: string) {
  (document.getElementById(id) ?? document.getElementById(fallbackId))?.focus();
}

/**
 * One controlled dialog at a time, opened from row actions. Radix returns
 * focus to a trigger, but these dialogs have none, so focus goes back to the
 * opener, or to the control that replaced it after the action, once closed.
 */
export function useManagedDialog<T>(fallbackFocusId: string) {
  const [dialog, setDialog] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  // Element to focus after the next render, for actions without a dialog.
  const pendingFocus = useRef<string | null>(null);
  // Element to focus once the open dialog finishes closing.
  const returnFocus = useRef(fallbackFocusId);

  useEffect(() => {
    if (!pendingFocus.current) return;
    focusById(pendingFocus.current, fallbackFocusId);
    pendingFocus.current = null;
  });

  function openDialog(next: T, openerId: string) {
    returnFocus.current = openerId;
    setDialog(next);
    setOpen(true);
  }

  function closeDialog(focusId?: string) {
    if (focusId) returnFocus.current = focusId;
    setOpen(false);
  }

  return {
    dialog,
    openDialog,
    closeDialog,
    focusAfterRender(id: string) {
      pendingFocus.current = id;
    },
    dialogProps: {
      open,
      onOpenChange: (next: boolean) => (next ? setOpen(true) : closeDialog()),
      onCloseAutoFocus: (event: Event) => {
        event.preventDefault();
        focusById(returnFocus.current, fallbackFocusId);
      },
    },
  };
}
