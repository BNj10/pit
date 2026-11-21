"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatEnrollmentMeeting } from "@/lib/enrollment";
import type { EnrollmentDialogIssue, EnrollmentOffering } from "@/types/enrollment-types";

interface EnrollmentValidationDialogProps {
  issue: EnrollmentDialogIssue | null;
  offerings: readonly EnrollmentOffering[];
  onClose: () => void;
  onReview: () => void;
  onReturnFocus: () => void;
}

function getDialogText(issue: EnrollmentDialogIssue) {
  switch (issue.type) {
    case "requirements":
      return {
        title: "Subject requirements not met",
        description: "Some selected subjects have unmet requirements. Review the prerequisites and corequisites before submitting again.",
      };
    case "slots-full":
      return {
        title: "No slots left",
        description: "These subjects filled before you submitted. Remove them from your summary or choose another section, then submit again.",
      };
    case "schedule-conflict":
      return {
        title: "These schedules overlap",
        description: `${issue.selected.code} · ${issue.selected.section} overlaps a subject in your enrollment summary. Choose a different section before trying again.`,
      };
  }
}

export function EnrollmentValidationDialog({
  issue, offerings, onClose, onReview, onReturnFocus,
}: EnrollmentValidationDialogProps) {
  if (!issue) return null;

  const { title, description } = getDialogText(issue);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] max-w-[600px] gap-[18px] overflow-y-auto rounded-xl border border-border bg-background p-6 text-foreground ring-0 shadow-[0_8px_24px_color-mix(in_srgb,var(--foreground)_9%,transparent)] sm:max-w-[600px]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(onReturnFocus);
        }}
      >
        <DialogTitle className={`pr-8 leading-[1.3] font-bold ${issue.type === "schedule-conflict" ? "text-[22px]" : "text-[21px]"}`}>{title}</DialogTitle>
        <DialogDescription className="text-[13px] leading-[1.5] text-pretty">{description}</DialogDescription>

        {issue.type === "requirements" && (
          <ul className="overflow-hidden rounded-lg border border-border" aria-label="Unmet subject requirements">
            {issue.requirements.map((requirement, index) => {
              const offering = offerings.find((item) => item.id === requirement.offeringId);
              return (
                <li key={`${requirement.offeringId}-${requirement.type}-${requirement.requiredSubjectCode}-${index}`} className="space-y-1 border-t border-border px-4 py-3 first:border-t-0 first:bg-destructive-soft/40">
                  <p className="text-xs leading-[1.45] font-semibold text-destructive">{requirement.type === "prerequisite" ? "Prerequisite not completed" : "Corequisite requirement unmet"}</p>
                  <p className="text-xs leading-[1.45] font-semibold">{offering?.code} · Required subject: {requirement.requiredSubjectCode}</p>
                  <p className="text-xs leading-[1.45] text-muted-foreground">{requirement.message}</p>
                </li>
              );
            })}
          </ul>
        )}

        {issue.type === "slots-full" && (
          <ul className="overflow-hidden rounded-lg border border-border" aria-label="Subjects with no slots left">
            {issue.offerings.map((offering) => (
              <li key={offering.id} className="space-y-1 border-t border-border px-4 py-3 first:border-t-0 first:bg-destructive-soft/40">
                <p className="text-xs leading-[1.45] font-semibold text-destructive">No slots left</p>
                <p className="text-xs leading-[1.45] font-semibold">{offering.code} · {offering.section} · {offering.title}</p>
              </li>
            ))}
          </ul>
        )}

        {issue.type === "schedule-conflict" && (
          <div className="overflow-hidden rounded-lg border border-border">
            {[
              { label: "SELECTED SECTION", offering: issue.selected, meeting: issue.selectedMeeting },
              { label: "IN YOUR SUMMARY", offering: issue.existing, meeting: issue.existingMeeting },
            ].map(({ label, offering, meeting }, index) => (
              <div key={label} className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3 ${index === 0 ? "bg-destructive-soft/40" : "border-t border-border"}`}>
                <div className="min-w-0 flex-1 space-y-[5px]">
                  <p className={`text-[9px] font-bold tracking-[0.6px] ${index === 0 ? "text-destructive" : "text-muted-foreground"}`}>{label}</p>
                  <p className="text-xs font-semibold">{offering.code} · {offering.section} · {offering.title}</p>
                </div>
                <p className={`text-[11px] font-semibold ${index === 0 ? "text-destructive" : "text-muted-foreground"}`}>{formatEnrollmentMeeting(meeting)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2.5">
          <DialogClose asChild><Button type="button" variant="outline" className="h-10 rounded-md px-4 text-xs font-semibold">{issue.type === "schedule-conflict" ? "Cancel" : "Close"}</Button></DialogClose>
          <Button type="button" className="h-10 rounded-md px-4 text-xs font-semibold" onClick={onReview}>
            {issue.type === "schedule-conflict" ? "Review sections" : "Review subjects"}
          </Button>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Close dialog" className="absolute top-3 right-3 size-11 text-muted-foreground"><X className="size-[18px]" aria-hidden="true" /></Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
