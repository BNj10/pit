import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface InstructorEvaluationNoticeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  titleId?: string;
  children?: ReactNode;
}

// Temporary state until the dedicated closed and empty evaluation designs are ready.
export function InstructorEvaluationNotice({ icon: Icon, title, description, titleId, children }: InstructorEvaluationNoticeProps) {
  return (
    <section className="chair-evaluation-notice" role="status" aria-labelledby={titleId}>
      <Icon aria-hidden="true" />
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  );
}
