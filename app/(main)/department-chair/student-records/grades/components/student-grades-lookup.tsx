"use client";

import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { findStudentRecord } from "@/lib/student-records";
import { studentRecordsHref } from "@/role-config";
import { currentTermEnrollmentsPreview, facultyGradesPreview } from "@/types/student-grades-exports";

import { useStudentRecords } from "../../components/student-records-provider";
import { StudentGradesContent } from "./student-grades-content";

/**
 * Finds the student in the shared preview state, which also holds students added
 * during this session. Invited students haven't set up their account, so they have
 * no grades or enrollment yet; other preview students keep the preview history.
 */
export function StudentGradesLookup({ studentNumber }: { studentNumber: string }) {
  const { students } = useStudentRecords();
  const student = findStudentRecord(students, studentNumber);

  if (!student) {
    return (
      <main className="student-grades-content" data-page="student-grades" aria-labelledby="student-grades-title">
        <div className="student-grades-empty">
          <div className="student-grades-empty-icon"><UserX aria-hidden="true" /></div>
          <h3 id="student-grades-title">Student not found</h3>
          <p className="student-grades-empty-description">
            This student isn&apos;t in your department&apos;s records, or was added in a session that has ended.
          </p>
          <div className="student-grades-empty-actions">
            <Button asChild variant="outline">
              <Link href={studentRecordsHref}>
                <ArrowLeft aria-hidden="true" />
                All students
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const data = student.invitation
    ? { ...facultyGradesPreview, records: {}, enrolledSubjects: null }
    : { ...facultyGradesPreview, enrolledSubjects: currentTermEnrollmentsPreview[student.studentNumber] ?? null };

  return <StudentGradesContent key={student.studentNumber} student={student} data={data} canCreateRecord />;
}
