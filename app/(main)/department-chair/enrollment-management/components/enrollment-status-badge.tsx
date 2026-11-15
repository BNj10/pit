import { enrollmentStatusLabel } from "@/lib/enrollment";
import type { EnrollmentStatusBadgeProps } from "@/types/enrollment-exports";

export function EnrollmentStatusBadge({ status, variant = "text" }: EnrollmentStatusBadgeProps) {
  return (
    <span className="enrollment-status" data-status={status} data-variant={variant}>
      {enrollmentStatusLabel(status)}
    </span>
  );
}
