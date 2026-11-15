"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSemesterGpa, getSubjectGradeResult } from "@/lib/student-grades";
import { canManageStudentGrades, hasUnpublishedGradeChanges } from "@/lib/student-grade-records";
import type { EditingStudentGrade, GradePeriod, SemesterGradesProps } from "@/types/student-grades-exports";

import { EmptyGradeRecord } from "./empty-grade-record";
import { GradeDialog } from "./grade-dialog";

export function SemesterGrades({
  record,
  canEditRecord,
  isViewingDraft,
  isEditing,
  semester,
  onCreate,
  onGradeChange,
  onSaveDraft,
  onPublish,
  onEdit,
  disabled,
}: SemesterGradesProps) {
  const [editing, setEditing] = useState<EditingStudentGrade | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const canManage = canManageStudentGrades(semester, canEditRecord);
  const isEditable = canManage && isEditing;
  const previousEditable = useRef(isEditable);
  const footerActionRef = useRef<HTMLButtonElement>(null);
  const showsDraftGrades = (canManage && isViewingDraft) || !record?.published;
  const isDraft = !!record && showsDraftGrades && hasUnpublishedGradeChanges(record);
  const grades = showsDraftGrades ? record?.draft : record?.published;
  const gpa = getSemesterGpa(grades?.subjects ?? []);
  const editedSubject = grades?.subjects.find((subject) => subject.code === editing?.code);
  const hasGrades = grades?.subjects.some((subject) => subject.midterm !== null || subject.final !== null);
  const visibilityLabel = isDraft ? "Not visible to students" : "Visible to the student";

  useEffect(() => {
    if (previousEditable.current !== isEditable && canManage) footerActionRef.current?.focus();
    previousEditable.current = isEditable;
  }, [isEditable, canManage]);

  return (
    <section aria-labelledby="semester-grades-title">
      <Card className="student-grades-record">
        <CardHeader className="student-grades-record-header">
          <div className="student-grades-heading">
            <h2 id="semester-grades-title">Semester Grades</h2>
            {record && (
              <Badge
                variant="secondary"
                className={isDraft ? "rounded-full" : "rounded-full border-success-border bg-success-soft text-success"}
              >
                {isDraft ? "Draft" : "Published"}
              </Badge>
            )}
          </div>
          <dl className="student-grades-gpa">
            <dt>SEMESTER GPA</dt>
            <dd aria-label={gpa === null ? "Not yet available" : undefined}>
              {gpa?.toFixed(2) ?? "—"}
            </dd>
          </dl>
        </CardHeader>
        <Table
          className="student-grades-table"
          aria-labelledby="semester-grades-title"
          containerProps={{
            className: "student-grades-table-scroll",
            role: "region",
            "aria-label": "Semester subjects and grades",
            tabIndex: 0,
          }}
        >
          <colgroup>
            <col className="student-grades-code-column" />
            <col />
            <col className="student-grades-grade-column" />
            <col className="student-grades-grade-column" />
            <col className="student-grades-status-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">SUBJECT CODE</TableHead>
              <TableHead scope="col">SUBJECT TITLE</TableHead>
              <TableHead scope="col">MIDTERM GRADE</TableHead>
              <TableHead scope="col">FINALS GRADE</TableHead>
              <TableHead scope="col">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades?.subjects.map((subject) => {
              const result = getSubjectGradeResult(subject.midterm, subject.final);
              return (
                <TableRow key={subject.code}>
                  <TableHead scope="row">{subject.code}</TableHead>
                  <TableCell className="student-grades-subject-title">{subject.title}</TableCell>
                  {(["midterm", "final"] satisfies GradePeriod[]).map((period) => {
                    const grade = subject[period];
                    const gradeLabel = typeof grade === "number" ? grade.toFixed(2) : grade;
                    return (
                      <TableCell key={period} className="student-grades-value">
                        {isEditable ? (
                          <Button
                            variant="outline"
                            className="student-grades-edit"
                            data-empty={grade === null}
                            aria-label={`${grade === null ? "Add" : "Edit"} ${period === "midterm" ? "midterm" : "finals"} grade for ${subject.title}${gradeLabel ? `, current grade ${gradeLabel}` : ""}`}
                            aria-haspopup="dialog"
                            disabled={disabled}
                            onClick={(event) => {
                              returnFocusRef.current = event.currentTarget;
                              setEditing({ code: subject.code, period });
                            }}
                          >
                            {gradeLabel ?? "Enter grade"}
                            <Pencil aria-hidden="true" />
                          </Button>
                        ) : (gradeLabel ?? "PENDING")}
                      </TableCell>
                    );
                  })}
                  <TableCell className="student-grades-status">
                    {result.status ?? "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {!record && <EmptyGradeRecord semester={semester} onCreate={onCreate} />}
        {record && (
          <CardFooter className="student-grades-footer">
            <p className="student-grades-publication">
              {visibilityLabel}{semester.schoolYearStatus === "completed" ? " · School year completed" : ""}
            </p>
            {canManage && (
              <div className="student-grades-footer-actions">
                <Button
                  ref={footerActionRef}
                  variant={isEditable || isDraft ? "outline" : "default"}
                  onClick={isEditable ? onSaveDraft : onEdit}
                  disabled={disabled}
                >
                  {isEditable ? (isDraft ? "Save Draft" : "Cancel") : isDraft ? "Edit Draft" : "Edit Grades"}
                </Button>
                {isDraft && (
                  <Button onClick={onPublish} disabled={disabled || !hasGrades}>Publish Grades</Button>
                )}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      {isEditable && editing && editedSubject && (
        <GradeDialog
          period={editing.period}
          value={editedSubject[editing.period]}
          returnFocusRef={returnFocusRef}
          onClose={() => setEditing(null)}
          onSave={(grade) => {
            onGradeChange(editing.code, editing.period, grade);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
