"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, Check, Info, Undo2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  classTypeUnits,
  enrollmentUnits,
  formatLongDate,
  formatMeeting,
  formatUnits,
  studentInitials,
  subjectUnits,
  yearLevelLabel,
} from "@/lib/enrollment-review";
import type { EnrollmentReviewDialogProps } from "@/types/enrollment-review-exports";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";

const returnMessageLimit = 500;

type ReviewMode = "review" | "return" | "approve" | "enrolled";

export function EnrollmentReviewDialog({
  enrollment,
  onClose,
  onApprove,
  onReturn,
  onMarkEnrolled,
}: EnrollmentReviewDialogProps) {
  const [mode, setMode] = useState<ReviewMode>("review");
  const [message, setMessage] = useState("");
  const [showMessageError, setShowMessageError] = useState(false);
  const { student, status } = enrollment;
  const firstName = student.name.split(" ")[0];
  const trimmedMessage = message.trim();
  const canReview = status === "pending-review" || status === "approved";

  function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedMessage) {
      setShowMessageError(true);
      return;
    }
    onReturn(trimmedMessage);
  }

  const title = mode === "return"
    ? "Return to student"
    : mode === "approve"
      ? "Approve enrollment?"
      : mode === "enrolled"
        ? "Mark as enrolled?"
        : status === "returned" ? "Returned enrollment" : "Selected subjects";
  const description = mode === "review"
    ? status === "returned" ? "The subjects the student submitted, and why they were returned." : "Review the subjects submitted by the student."
    : `${student.name} · ${student.studentNumber}`;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="enrollment-dialog" data-mode={mode} showCloseButton={false}>
        <header className="enrollment-dialog-header">
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
        </header>

        {mode === "review" && (
          <>
            <div className="enrollment-dialog-body">
              <div className="enrollment-student-summary">
                <span className="enrollment-avatar" aria-hidden="true">{studentInitials(student.name)}</span>
                <div>
                  <p>{student.name}</p>
                  <p>{student.studentNumber} · {student.program} · {yearLevelLabel(student.yearLevel)}</p>
                </div>
                <EnrollmentStatusBadge status={status} variant="pill" />
              </div>

              {status === "returned" && enrollment.lastReturn && (
                <section className="enrollment-return-note" aria-labelledby="enrollment-return-heading">
                  <h3 id="enrollment-return-heading">Returned {formatLongDate(enrollment.lastReturn.returnedAt)}</h3>
                  <p>{enrollment.lastReturn.message}</p>
                </section>
              )}

              <section aria-labelledby="enrollment-selection-heading" className="enrollment-selection">
                <h3 id="enrollment-selection-heading">Enrollment selection</h3>
                <div className="enrollment-subjects-scroll" tabIndex={0} role="region" aria-label="Submitted subjects">
                  <table className="enrollment-subjects-table">
                    <thead>
                      <tr>
                        <th scope="col">Code</th>
                        <th scope="col">Subject title</th>
                        <th scope="col">Schedule</th>
                        <th scope="col">Section / Room(s)</th>
                        <th scope="col" className="enrollment-numeric">Lec/Lab<br />units</th>
                        <th scope="col" className="enrollment-numeric">Total<br />units</th>
                        <th scope="col" className="enrollment-numeric">Units<br />taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollment.subjects.map((subject) => {
                        const meetings = subject.parts.flatMap((part) => part.meetings);
                        const units = subjectUnits(subject);
                        return (
                          <tr key={subject.code}>
                            <th scope="row" className="enrollment-subject-code">{subject.code}</th>
                            <td>{subject.title}</td>
                            <td>
                              {meetings.map((meeting, index) => (
                                <span key={index} className="enrollment-line">{formatMeeting(meeting)}</span>
                              ))}
                            </td>
                            <td>
                              {meetings.map((meeting, index) => (
                                <span key={index} className="enrollment-line">
                                  {index === 0 ? `${subject.section} / ${meeting.room}` : meeting.room}
                                </span>
                              ))}
                            </td>
                            <td className="enrollment-numeric enrollment-split-units">
                              <span className="sr-only">
                                {formatUnits(classTypeUnits(subject, "lecture"))} lecture and {formatUnits(classTypeUnits(subject, "laboratory"))} laboratory units
                              </span>
                              <span aria-hidden="true">
                                {formatUnits(classTypeUnits(subject, "lecture"))}/{formatUnits(classTypeUnits(subject, "laboratory"))}
                              </span>
                            </td>
                            <td className="enrollment-numeric enrollment-strong-units">{formatUnits(units)}</td>
                            <td className="enrollment-numeric enrollment-strong-units">{formatUnits(units)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="enrollment-total">
                <p>Total units taken</p>
                <p>{formatUnits(enrollmentUnits(enrollment))} units</p>
              </div>

              <p className="enrollment-dialog-notice">
                <Info aria-hidden="true" />
                {status === "pending-review" && "Review the selected subjects before approving or returning this enrollment."}
                {status === "approved" && "Approved. The student is getting their Certificate of Enrollment signed. Mark them as enrolled once every signature is complete."}
                {status === "returned" && "Waiting for the student to revise and resubmit their subjects."}
                {status === "enrolled" && "This student is enrolled. Their subjects are final for this term."}
              </p>
            </div>

            <footer className="enrollment-dialog-footer">
              {canReview ? (
                <>
                  <Button type="button" variant="outline" className="enrollment-return-button" onClick={() => setMode("return")}>
                    <Undo2 aria-hidden="true" />
                    Return to student
                  </Button>
                  {status === "pending-review" ? (
                    <Button type="button" onClick={() => setMode("approve")}>
                      Approve enrollment
                      <Check aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => setMode("enrolled")}>
                      Mark as enrolled
                      <BadgeCheck aria-hidden="true" />
                    </Button>
                  )}
                </>
              ) : (
                <DialogClose asChild>
                  <Button type="button" variant="outline">Close</Button>
                </DialogClose>
              )}
            </footer>
          </>
        )}

        {mode === "return" && (
          <form className="enrollment-dialog-form" onSubmit={submitReturn} noValidate>
            <div className="enrollment-dialog-body">
              <p className="enrollment-dialog-text">
                {status === "approved"
                  ? `This withdraws the approval. ${firstName} will need to revise and resubmit their subjects.`
                  : `${firstName} will see your message and can revise and resubmit their subjects.`}
              </p>
              <div className="enrollment-message-field">
                <Label htmlFor="enrollment-return-message">Message to the student</Label>
                <Textarea
                  id="enrollment-return-message"
                  value={message}
                  maxLength={returnMessageLimit}
                  rows={5}
                  autoFocus
                  aria-invalid={showMessageError && !trimmedMessage}
                  aria-describedby="enrollment-return-message-help"
                  placeholder="Explain what needs to change, e.g. a schedule conflict or a missing subject."
                  onChange={(event) => setMessage(event.target.value)}
                />
                <p id="enrollment-return-message-help" data-error={showMessageError && !trimmedMessage}>
                  {showMessageError && !trimmedMessage ? "Enter a message so the student knows what to change." : "Required."}
                  <span>{message.length}/{returnMessageLimit}</span>
                </p>
              </div>
            </div>
            <footer className="enrollment-dialog-footer">
              <Button type="button" variant="outline" onClick={() => setMode("review")}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <Button type="submit" className="enrollment-return-confirm">
                <Undo2 aria-hidden="true" />
                Return enrollment
              </Button>
            </footer>
          </form>
        )}

        {(mode === "approve" || mode === "enrolled") && (
          <>
            <div className="enrollment-dialog-body">
              <p className="enrollment-dialog-text">
                {mode === "approve"
                  ? `Approve ${firstName}'s ${enrollment.subjects.length} subjects (${formatUnits(enrollmentUnits(enrollment))} units). They will receive their Certificate of Enrollment to have it signed.`
                  : `Confirm that ${firstName}'s Certificate of Enrollment has every required signature. Marking them as enrolled can't be undone here.`}
              </p>
            </div>
            <footer className="enrollment-dialog-footer">
              <Button type="button" variant="outline" onClick={() => setMode("review")}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <Button type="button" onClick={mode === "approve" ? onApprove : onMarkEnrolled}>
                {mode === "approve" ? <Check aria-hidden="true" /> : <BadgeCheck aria-hidden="true" />}
                {mode === "approve" ? "Approve enrollment" : "Mark as enrolled"}
              </Button>
            </footer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
