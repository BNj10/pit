import { enrollmentStatusLabel } from "@/lib/enrollment-review";
import type { EnrollmentStatusBadgeProps } from "@/types/enrollment-review-exports";

export function EnrollmentStatusBadge({ status, variant = "text" }: EnrollmentStatusBadgeProps) {
  return (
    <span className="enrollment-status" data-status={status} data-variant={variant}>
      {enrollmentStatusLabel(status)}
    </span>
  );
}
