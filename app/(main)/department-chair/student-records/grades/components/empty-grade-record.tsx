import { FilePlus2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EmptyGradeRecordProps } from "@/types/student-grades-exports";

export function EmptyGradeRecord({
  semester,
  onCreate,
  notice,
}: EmptyGradeRecordProps) {
  return (
    <div className="student-grades-empty">
      <div className="student-grades-empty-icon"><FilePlus2 aria-hidden="true" /></div>
      <h3>No grades published yet</h3>
      <p className="student-grades-empty-description">
        There are no grade records for {semester.label.replace(" · ", ", ")}.
        {semester.schoolYearStatus === "current" && (
          <>
            <br />
            Create a grade record for a student to get this semester started.
          </>
        )}
      </p>
      {notice && <p className="student-grades-empty-notice" role="alert">{notice}</p>}
      {semester.schoolYearStatus === "current" && (
        <div className="student-grades-empty-actions">
          <Button className="student-grades-create" onClick={onCreate} disabled={!onCreate}>
            <Plus aria-hidden="true" />
            Create grade record
          </Button>
        </div>
      )}
      <p className="student-grades-empty-note">
        {semester.schoolYearStatus === "completed" ? "This school year has ended." : "Only department chairs can create grade records."}
      </p>
    </div>
  );
}
