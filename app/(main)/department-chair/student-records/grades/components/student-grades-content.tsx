"use client";

import { useReducer, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  canManageStudentGrades,
  createStudentGradeRecordsState,
  hasUnpublishedGradeChanges,
  studentGradeRecordsReducer,
} from "@/lib/student-grade-records";
import type { GradePeriod, StudentGrade, StudentGradesContentProps } from "@/types/student-grades-exports";

import { GradesToolbar } from "./grades-toolbar";
import { SemesterGrades } from "./semester-grades";

export function StudentGradesContent({ data, student, canCreateRecord = false }: StudentGradesContentProps) {
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState(data.initialSemester);
  const [state, dispatch] = useReducer(studentGradeRecordsReducer, data.records, createStudentGradeRecordsState);
  const [isReloading, startReload] = useTransition();
  const [announcement, setAnnouncement] = useState("");
  const [createNotice, setCreateNotice] = useState("");
  const semester = data.semesters.find((option) => option.value === selectedSemester);
  const record = state.records[selectedSemester];

  if (!semester) throw new Error("Student grades must provide a valid initial semester.");

  const canManage = canManageStudentGrades(semester, canCreateRecord);
  const isViewingDraft = canManage && !!record && (!record.published || state.draftView?.semester === selectedSemester);
  const isEditing = isViewingDraft && state.draftView?.semester === selectedSemester && state.draftView.isEditing;
  const actionContext = { semester, canEditRecord: canCreateRecord };

  function updateGrade(code: string, period: GradePeriod, grade: StudentGrade) {
    if (!isEditing || isReloading) return;
    dispatch({ ...actionContext, type: "change-grade", code, period, grade });
    setAnnouncement(`${period === "midterm" ? "Midterm" : "Finals"} grade updated for ${code}. Status recalculated.`);
  }

  return (
    <main className="student-grades-content" data-page="student-grades" aria-labelledby="student-grades-title" aria-describedby="student-grades-student">
      <p id="student-grades-student" className="sr-only">{student.name}, student number {student.studentNumber}</p>
      <GradesToolbar
        semesters={data.semesters}
        selectedSemester={selectedSemester}
        isReloading={isReloading}
        onSemesterChange={(value) => {
          if (data.semesters.some((option) => option.value === value)) {
            setSelectedSemester(value);
            setAnnouncement("");
            setCreateNotice("");
          }
        }}
        onReload={() => startReload(() => {
          dispatch({ ...actionContext, type: "reload" });
          router.refresh();
          setAnnouncement("Preview records reloaded. Unsaved changes have been discarded.");
        })}
      />
      <div aria-busy={isReloading}>
        <SemesterGrades
          key={selectedSemester}
          record={canCreateRecord || record?.published ? record : undefined}
          canEditRecord={canCreateRecord}
          isViewingDraft={isViewingDraft}
          isEditing={isEditing}
          semester={semester}
          disabled={isReloading}
          onCreate={canManage && !record && !isReloading ? () => {
            // A grade record lists the subjects the student is enrolled in this term.
            if (!data.enrolledSubjects || data.enrolledSubjects.length === 0) {
              setCreateNotice(`${student.name} isn't enrolled in ${semester.label.replace(" · ", ", ")} yet. You can create a grade record once their enrollment is approved.`);
              return;
            }
            dispatch({ ...actionContext, type: "create", subjects: data.enrolledSubjects });
            setAnnouncement("Grade record created in this preview.");
          } : undefined}
          createNotice={createNotice}
          onGradeChange={updateGrade}
          onSaveDraft={() => {
            if (!isEditing || isReloading) return;
            dispatch({ ...actionContext, type: "save-draft" });
            setAnnouncement(record && hasUnpublishedGradeChanges(record)
              ? "Draft saved for this preview session. Select Edit Draft to make changes."
              : "No grade changes. The published grades are unchanged.");
          }}
          onPublish={() => {
            if (!isViewingDraft || isReloading || !record?.draft.subjects.some((subject) => subject.midterm !== null || subject.final !== null)) return;
            dispatch({ ...actionContext, type: "publish" });
            setAnnouncement("Grades published in this preview session.");
          }}
          onEdit={() => {
            if (!canManage || !record || isReloading) return;
            dispatch({ ...actionContext, type: "edit" });
            setAnnouncement("Editing grades. Changes stay in draft until published.");
          }}
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{isReloading ? "Reloading records." : announcement}</p>
    </main>
  );
}
