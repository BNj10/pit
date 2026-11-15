"use client";

import { Send, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ConfirmDialogProps } from "@/types/sections-exports";

export function ConfirmDialog({ title, description, details = [], confirmLabel, tone, onClose, onConfirm }: ConfirmDialogProps) {
  const Icon = tone === "destructive" ? Trash2 : Send;

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
        {details.length > 0 && (
          <ul className="section-confirm-details">
            {details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        )}
        <footer className="section-delete-dialog-actions">
          <AlertDialogCancel variant="outline">
            Cancel
            <X aria-hidden="true" />
          </AlertDialogCancel>
          <AlertDialogAction className={tone === "destructive" ? "section-delete-confirm" : undefined} onClick={onConfirm}>
            {confirmLabel}
            <Icon aria-hidden="true" />
          </AlertDialogAction>
        </footer>
      </AlertDialogContent>
    </AlertDialog>
  );
}
