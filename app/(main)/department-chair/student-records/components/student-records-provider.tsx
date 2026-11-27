"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { invitationLifetimeMs } from "@/lib/student-records";

import type {
  StudentRecordsContextValue,
  StudentRecordsData,
  StudentRecordStudent,
} from "@/types/student-records-exports";

const StudentRecordsContext = createContext<StudentRecordsContextValue | null>(null);

// Shares preview students between the Student Records list and each student's
// grades page; changes are lost on refresh. Saving students and sending
// invitations belong to the future server boundary (ADR 0003).
export function StudentRecordsProvider({ data, children }: { data: StudentRecordsData; children: ReactNode }) {
  const [students, setStudents] = useState<readonly StudentRecordStudent[]>(data.students);
  const [now, setNow] = useState(() => Date.now());

  // Re-render when the next open invitation expires, so its pill updates on time.
  useEffect(() => {
    const nextExpiry = Math.min(
      ...students
        .filter((student) => student.invitation)
        .map((student) => Date.parse(student.invitation!.sentAt) + invitationLifetimeMs)
        .filter((expiry) => expiry > now),
    );
    if (!Number.isFinite(nextExpiry)) return;
    const timer = window.setTimeout(() => setNow(Date.now()), nextExpiry - now);
    return () => window.clearTimeout(timer);
  }, [students, now]);

  const value: StudentRecordsContextValue = {
    ...data,
    students,
    now,
    addStudent(student) {
      const sentAt = new Date().toISOString();
      // Newest first, so a new student appears at the top of the list.
      setStudents((current) => [{ ...student, invitation: { sentAt } }, ...current]);
      setNow(Date.now());
    },
    resendInvitation(studentNumber) {
      const sentAt = new Date().toISOString();
      setStudents((current) => current.map((student) => (
        student.studentNumber === studentNumber && student.invitation ? { ...student, invitation: { sentAt } } : student
      )));
      setNow(Date.now());
    },
  };

  return <StudentRecordsContext.Provider value={value}>{children}</StudentRecordsContext.Provider>;
}

export function useStudentRecords() {
  const context = useContext(StudentRecordsContext);
  if (!context) throw new Error("useStudentRecords must be used inside StudentRecordsProvider.");
  return context;
}
