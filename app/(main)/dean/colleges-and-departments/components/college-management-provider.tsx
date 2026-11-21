"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { collegeManagementPreview } from "@/types/college-management-exports";
import { buildCollege } from "@/lib/college-management";
import { buildDepartment } from "@/lib/department-management";
import type { College, CreateCollegeInput, CreateDepartmentInput, Department, UpdateDepartmentInput } from "@/types/college-management-types";

const CollegeManagementContext = createContext<{
  colleges: readonly College[];
  departments: readonly Department[];
  editingDepartmentId: string | null;
  setEditingDepartmentId: (departmentId: string | null) => void;
  createCollege: (input: CreateCollegeInput) => Promise<void>;
  createDepartment: (input: CreateDepartmentInput) => Promise<void>;
  updateDepartment: (departmentId: string, input: UpdateDepartmentInput) => Promise<void>;
} | null>(null);

// Preview state belongs to the shared layout so it survives directory navigation.
// Replace these mutations with authorized server operations when persistence is added.
export function CollegeManagementProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<College[]>(collegeManagementPreview.colleges);
  const collegeRecords = useRef<readonly College[]>(collegeManagementPreview.colleges);
  const [departments, setDepartments] = useState<Department[]>(collegeManagementPreview.departments);
  const departmentRecords = useRef<readonly Department[]>(collegeManagementPreview.departments);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const logoUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = logoUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  useEffect(() => {
    // College and department logos share one set of object URLs.
    const activeUrls = new Set([...colleges, ...departments].map((record) => record.logoUrl));
    for (const url of logoUrls.current) {
      if (!activeUrls.has(url)) {
        URL.revokeObjectURL(url);
        logoUrls.current.delete(url);
      }
    }
  }, [colleges, departments]);

  async function createCollege(input: CreateCollegeInput) {
    // Validate against the latest committed records, including same-tick submissions.
    const college = buildCollege(input, collegeRecords.current);
    if (college.logoUrl) logoUrls.current.add(college.logoUrl);
    const next = [...collegeRecords.current, college];
    collegeRecords.current = next;
    setColleges(next);
  }

  function saveDepartment(input: UpdateDepartmentInput, departmentId?: string) {
    // Validate against the latest committed records, including same-tick submissions.
    const records = departmentRecords.current;
    const department = buildDepartment(input, collegeRecords.current, records, departmentId);
    if (input.identity?.kind === "logo" && department.logoUrl) {
      logoUrls.current.add(department.logoUrl);
    }
    const next = departmentId === undefined ? [...records, department]
      : records.map((record) => record.id === departmentId ? department : record);
    departmentRecords.current = next;
    setDepartments(next);
  }

  async function createDepartment(input: CreateDepartmentInput) {
    saveDepartment(input);
  }

  async function updateDepartment(departmentId: string, input: UpdateDepartmentInput) {
    saveDepartment(input, departmentId);
  }

  return (
    <CollegeManagementContext.Provider value={{ colleges, departments, editingDepartmentId, setEditingDepartmentId, createCollege, createDepartment, updateDepartment }}>
      {children}
    </CollegeManagementContext.Provider>
  );
}

export function useCollegeManagement() {
  const context = useContext(CollegeManagementContext);
  if (!context) throw new Error("College management requires its directory layout.");
  return context;
}
