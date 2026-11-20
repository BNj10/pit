"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { syncCorequisites } from "@/lib/curriculum-subjects";
import type {
  CurriculaContextValue,
  Curriculum,
  CurriculumManagementData,
  Subject,
} from "@/types/curriculum-types";

const CurriculaContext = createContext<CurriculaContextValue | null>(null);

// Shares the in-memory preview workflow between the curricula list and each
// curriculum's subjects page; changes are lost on refresh. Identity,
// persistence, and authoritative validation belong to the future server boundary.
export function CurriculaProvider({ data, children }: { data: CurriculumManagementData; children: ReactNode }) {
  const [curricula, setCurricula] = useState<readonly Curriculum[]>(data.curricula);
  const [subjects, setSubjects] = useState<readonly Subject[]>(data.subjects);

  const value: CurriculaContextValue = {
    program: data.program,
    curricula,
    subjects,
    createCurriculum(details) {
      const curriculum: Curriculum = { id: crypto.randomUUID(), ...details, status: "Draft" };
      setCurricula((current) => [...current, curriculum]);
      return curriculum;
    },
    updateCurriculum(id, change) {
      setCurricula((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)));
    },
    deleteCurriculum(id) {
      setCurricula((current) => current.filter((item) => item.id !== id));
      setSubjects((current) => current.filter((item) => item.curriculumId !== id));
    },
    addSubject(curriculumId, details) {
      const subject: Subject = { id: crypto.randomUUID(), curriculumId, ...details };
      setSubjects((current) => syncCorequisites([...current, subject], subject.id, subject.corequisiteIds));
      return subject;
    },
    updateSubject(id, details) {
      setSubjects((current) =>
        syncCorequisites(
          current.map((item) => (item.id === id ? { ...item, ...details } : item)),
          id,
          details.corequisiteIds,
        ),
      );
    },
    deleteSubject(id) {
      // Deletion is blocked while other subjects require this one; dropping
      // stale references keeps the data consistent regardless.
      setSubjects((current) =>
        current
          .filter((item) => item.id !== id)
          .map((item) =>
            item.prerequisiteIds.includes(id) || item.corequisiteIds.includes(id)
              ? {
                  ...item,
                  prerequisiteIds: item.prerequisiteIds.filter((requisite) => requisite !== id),
                  corequisiteIds: item.corequisiteIds.filter((requisite) => requisite !== id),
                }
              : item,
          ),
      );
    },
  };

  return <CurriculaContext.Provider value={value}>{children}</CurriculaContext.Provider>;
}

export function useCurricula() {
  const context = useContext(CurriculaContext);
  if (!context) throw new Error("useCurricula must be used inside CurriculaProvider.");
  return context;
}
