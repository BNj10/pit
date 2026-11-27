"use client";

import { useRef } from "react";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isInvitationExpired } from "@/lib/student-records";
import type { StudentRecordStudent } from "@/types/student-records-exports";

import { useStudentRecords } from "./student-records-provider";

/**
 * Shows that a student hasn't finished account setup. Once the invitation link has
 * expired, the whole pill becomes a button that resends it. Preview only: nothing is
 * emailed until invitations move to the server (ADR 0003).
 */
export function InvitationBadge({ student, invitation }: {
  student: StudentRecordStudent;
  invitation: NonNullable<StudentRecordStudent["invitation"]>;
}) {
  const { now, resendInvitation } = useStudentRecords();
  // After a resend the button turns back into a plain pill; keep focus on it.
  const focusAfterResend = useRef(false);

  if (!isInvitationExpired(invitation, now)) {
    return (
      <span
        ref={(node) => {
          if (node && focusAfterResend.current) {
            focusAfterResend.current = false;
            node.focus();
          }
        }}
        className="student-records-invited-badge"
        tabIndex={-1}
      >
        Invited
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="student-records-invited-badge"
          data-expired
          aria-label={`Invite expired. Resend invitation to ${student.name}`}
          onClick={() => {
            focusAfterResend.current = true;
            resendInvitation(student.studentNumber);
            toast.success(`A new invitation was sent to ${student.email}.`);
          }}
        >
          Invite expired
          <RotateCw aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Resend invite</TooltipContent>
    </Tooltip>
  );
}
