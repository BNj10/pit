"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
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
import { evaluationTermLabel } from "@/lib/faculty-evaluation";
import type { EvaluationTermResult } from "@/types/faculty-evaluation-types";

/**
 * Archives or restores a completed term's results. Archiving only hides the
 * term from the history list; every rating and comment is kept. `onDone`
 * moves focus because the row moves or changes after either action.
 */
export function ArchiveResultAction({ result, archived, onDone }: {
  result: EvaluationTermResult;
  archived: boolean;
  onDone: () => void;
}) {
  const { archiveResult, restoreResult } = useEvaluation();
  const confirmed = useRef(false);
  const term = evaluationTermLabel(result);

  if (archived) {
    return (
      <Button
        type="button"
        variant="link"
        aria-label={`Restore results for ${term}`}
        onClick={() => {
          restoreResult(result.id);
          toast.success(`Results for ${term} restored.`);
          onDone();
        }}
      >
        Restore
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="link" aria-label={`Archive results for ${term}`}>
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onCloseAutoFocus={(event) => {
        // Cancelling returns focus to the trigger; after archiving its row is hidden.
        if (!confirmed.current) return;
        event.preventDefault();
        onDone();
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive results for {term}?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be hidden from Previous semester results. All ratings and comments are kept, and you can restore it
            from Show archived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep in list</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmed.current = true;
              archiveResult(result.id);
              toast.success(`Results for ${term} archived.`);
            }}
          >
            Archive results
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
