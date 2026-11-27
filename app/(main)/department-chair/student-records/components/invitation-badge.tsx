"use client";

import { RotateCw } from "lucide-react";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isInvitationExpired } from "@/lib/student-records";
import type { StudentRecordStudent } from "@/types/student-records-exports";

import { useStudentRecords } from "./student-records-provider";

/**
 * Shows that a student hasn't finished account setup. Once the invitation link has
 * expired, the pill offers an icon button to resend it. Preview only: nothing is
 * emailed until invitations move to the server (ADR 0003).
 */
export function InvitationBadge({ student, invitation }: {
  student: StudentRecordStudent;
  invitation: NonNullable<StudentRecordStudent["invitation"]>;
}) {
  const { now, resendInvitation } = useStudentRecords();
  const expired = isInvitationExpired(invitation, now);

  return (
    <span className="student-records-invited-badge" data-expired={expired || undefined}>
      {expired ? "Invite expired" : "Invited"}
      {expired && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="student-records-resend-button"
              aria-label={`Resend invitation to ${student.name}`}
              onClick={() => {
                resendInvitation(student.studentNumber);
                toast.success(`A new invitation was sent to ${student.email}.`);
              }}
            >
              <RotateCw aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Resend invite</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
