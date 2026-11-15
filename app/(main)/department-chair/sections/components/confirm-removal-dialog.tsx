"use client";

import { Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ConfirmRemovalDialogProps } from "@/types/sections-exports";

export function ConfirmRemovalDialog({ title, description, confirmLabel, onClose, onConfirm }: ConfirmRemovalDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="section-delete-dialog">
        <header className="section-delete-dialog-header">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogCancel variant="ghost" size="icon-sm" aria-label="Close">
            <X aria-hidden="true" />
          </AlertDialogCancel>
        </header>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <footer className="section-delete-dialog-actions">
          <AlertDialogCancel variant="outline">
            Cancel
            <X aria-hidden="true" />
          </AlertDialogCancel>
          <AlertDialogAction className="section-delete-confirm" onClick={onConfirm}>
            {confirmLabel}
            <Trash2 aria-hidden="true" />
          </AlertDialogAction>
        </footer>
      </AlertDialogContent>
    </AlertDialog>
  );
}
