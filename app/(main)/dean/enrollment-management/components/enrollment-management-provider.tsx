"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import {
  academicYearId,
  activateAcademicYear,
  completeAcademicYear,
  createAcademicYear,
  startNextTerm,
  updateAcademicYear,
} from "@/lib/academic-calendar";
import {
  blankEnrollmentWindows,
  publishableEnrollmentWindows,
  validateEnrollmentWindows,
} from "@/lib/enrollment-schedule";
import type {
  AcademicCalendarChange,
  AcademicYear,
  EnrollmentManagementContextValue,
  EnrollmentManagementData,
  EnrollmentSchedule,
  EnrollmentWindow,
} from "@/types/enrollment-management-exports";

const EnrollmentManagementContext = createContext<EnrollmentManagementContextValue | null>(null);

// Preview state shared by both tabs. Identity, persistence, and authoritative
// validation belong to the future authenticated server boundary.
export function EnrollmentManagementProvider({ data, children }: {
  data: EnrollmentManagementData;
  children: ReactNode;
}) {
  const [academicYears, setAcademicYears] = useState<readonly AcademicYear[]>(data.academicYears);
  const [schedules, setSchedules] = useState<readonly EnrollmentSchedule[]>(data.schedules);
  // Latest years for validation, including changes made in the same tick.
  const yearsRef = useRef(academicYears);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(Date.now()), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);

  function apply(change: AcademicCalendarChange) {
    if (change.years) {
      yearsRef.current = change.years;
      setAcademicYears(change.years);
    }
    return change;
  }

  function updateSchedule(termId: string, update: (schedule: EnrollmentSchedule) => EnrollmentSchedule) {
    setSchedules((current) => current.map((schedule) => schedule.termId === termId ? update(schedule) : schedule));
  }

  const value: EnrollmentManagementContextValue = {
    academicYears,
    schedules,
    now,
    createAcademicYear: (values) => apply(createAcademicYear(values, yearsRef.current)),
    updateAcademicYear: (yearId, values) => {
      const change = apply(updateAcademicYear(yearId, values, yearsRef.current));
      // A draft year that changed its year keeps its schedules under the new id.
      const nextId = academicYearId(values.startYear);
      if (change.years && nextId !== yearId) {
        setSchedules((current) => current.map((schedule) => schedule.termId.startsWith(`${yearId}:`)
          ? { ...schedule, termId: `${nextId}:${schedule.termId.slice(yearId.length + 1)}` }
          : schedule));
      }
      return change;
    },
    activateAcademicYear: (yearId) => apply(activateAcademicYear(yearId, yearsRef.current)),
    completeAcademicYear: (yearId) => apply(completeAcademicYear(yearId, yearsRef.current)),
    startNextTerm: (yearId) => apply(startNextTerm(yearId, yearsRef.current)),
    createSchedule: (termId) => setSchedules((current) => current.some((schedule) => schedule.termId === termId)
      ? current
      : [...current, { termId, draft: blankEnrollmentWindows(), published: null, paused: false }]),
    saveDraft: (termId, windows: readonly EnrollmentWindow[]) => updateSchedule(termId, (schedule) => ({ ...schedule, draft: windows })),
    publishSchedule: (termId, windows) => {
      const errors = validateEnrollmentWindows(windows);
      if (errors) return errors;
      // Groups left blank stay unpublished, so their students see no enrollment yet.
      updateSchedule(termId, (schedule) => ({ ...schedule, draft: windows, published: publishableEnrollmentWindows(windows) }));
      return null;
    },
    setPaused: (termId, paused) => updateSchedule(termId, (schedule) => ({ ...schedule, paused })),
  };

  return <EnrollmentManagementContext.Provider value={value}>{children}</EnrollmentManagementContext.Provider>;
}

export function useEnrollmentManagement() {
  const context = useContext(EnrollmentManagementContext);
  if (!context) throw new Error("Enrollment management pages must be inside EnrollmentManagementProvider.");
  return context;
}
