import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface EnrollmentFeedback {
  message: string;
  returnedAt: string;
}

export function EnrollmentFeedbackCard({
  feedback,
  enrollmentHref,
}: {
  feedback: EnrollmentFeedback | null;
  enrollmentHref: string;
}) {
  const returnedAt = feedback ? new Date(feedback.returnedAt) : null;
  const dateLabel = returnedAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "Asia/Manila" }).format(returnedAt)
    : "";
  const timeLabel = returnedAt
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(returnedAt)
    : "";

  return (
    <Card className="w-full max-w-[540px] gap-0 rounded-lg border border-border bg-background p-0 ring-0">
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-xl font-bold">
          {feedback ? "Enrollment returned" : "Enrollment feedback"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {feedback ? "Updates are required before approval" : "Updates from your Department Chair"}
        </p>
      </div>
      {feedback ? (
        <>
          <div className="space-y-2.5 px-6 py-5">
            <p className="text-xs font-semibold text-primary">
              Message from the Department Chair
            </p>
            <blockquote className="rounded-md border-l-[3px] border-l-[#4f8c80] bg-primary-soft px-[18px] py-4 text-[15px] leading-[1.55] text-foreground whitespace-pre-wrap break-words">
              {feedback.message}
            </blockquote>
          </div>
          <div className="space-y-3.5 border-t border-border px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">Returned on</span>
              <time dateTime={feedback.returnedAt} className="font-bold">{dateLabel} · {timeLabel}</time>
            </div>
            <Button asChild className="h-auto min-h-11 w-full px-4 py-[13px] text-[13px] whitespace-normal">
              <Link href={enrollmentHref}>
                Review and update enrollment
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <p className="px-6 py-5 text-sm text-muted-foreground">No enrollment feedback from your Department Chair yet.</p>
      )}
    </Card>
  );
}
