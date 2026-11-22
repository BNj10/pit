import Link from "next/link";
import { CalendarPlus, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { portalRoleConfig } from "@/role-config";

const enrollmentItem = portalRoleConfig.student.navigation.find(
  (item) => item.icon === "enrollment",
);

export function SubjectsEnrolledEmptyState({ term }: { term: string }) {
  return (
    <section
      data-page="subjects-enrolled"
      className="subjects-enrolled-empty"
      aria-labelledby="subjects-enrolled-title"
    >
      <header className="subjects-enrolled-empty-header">
        <h2 id="subjects-enrolled-title">Currently enrolled subjects</h2>
        <p>{term}</p>
      </header>
      <div className="subjects-enrolled-empty-body">
        <div className="subjects-enrolled-empty-icon" aria-hidden="true">
          <CalendarPlus />
        </div>
        <h3>You’re not enrolled yet</h3>
        {enrollmentItem && (
          <Button asChild className="subjects-enrolled-empty-action">
            <Link href={enrollmentItem.href}>Go to Enrollment</Link>
          </Button>
        )}
      </div>
      <div className="subjects-enrolled-empty-guidance">
        <Info aria-hidden="true" />
        <p>
          Your subjects will appear here once your department chair approves your enrollment.
        </p>
      </div>
    </section>
  );
}
