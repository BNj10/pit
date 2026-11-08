"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { collegeManagementPreview } from "@/types/college-management-exports";
import { buildDepartment } from "@/lib/department-management";
import type { College, CreateDepartmentInput, Department, UpdateDepartmentInput } from "@/types/college-management-types";

export type DirectoryDetails = Pick<College, "name" | "code" | "description">;

const CollegeManagementContext = createContext<{
  colleges: readonly College[];
  departments: readonly Department[];
  editingDepartmentId: string | null;
  setEditingDepartmentId: (departmentId: string | null) => void;
  addCollege: (details: DirectoryDetails) => void;
  createDepartment: (input: CreateDepartmentInput) => Promise<void>;
  updateDepartment: (departmentId: string, input: UpdateDepartmentInput) => Promise<void>;
} | null>(null);

function validateDetails(details: DirectoryDetails, records: readonly DirectoryDetails[]) {
  const values = {
    name: details.name.trim(),
    code: details.code.trim(),
    description: details.description.trim(),
  };

  if (!values.name || !values.code) throw new Error("Name and code are required.");
  if (records.some((record) => record.code.toLowerCase() === values.code.toLowerCase())) {
    throw new Error("This code is already in use. Enter a unique code.");
  }

  return values;
}

// Preview state belongs to the shared layout so it survives directory navigation.
// Replace these mutations with authorized server operations when persistence is added.
export function CollegeManagementProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<College[]>(collegeManagementPreview.colleges);
  const [departments, setDepartments] = useState<Department[]>(collegeManagementPreview.departments);
  const departmentRecords = useRef<readonly Department[]>(collegeManagementPreview.departments);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const logoUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = logoUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  useEffect(() => {
    const activeUrls = new Set(departments.map((department) => department.logoUrl));
    for (const url of logoUrls.current) {
      if (!activeUrls.has(url)) {
        URL.revokeObjectURL(url);
        logoUrls.current.delete(url);
      }
    }
  }, [departments]);

  function addCollege(details: DirectoryDetails) {
    const values = validateDetails(details, colleges);
    setColleges((previous) => [...previous, { ...values, id: crypto.randomUUID(), icon: "building-2" }]);
  }

  function saveDepartment(input: UpdateDepartmentInput, departmentId?: string) {
    // Validate against the latest committed records, including same-tick submissions.
    const records = departmentRecords.current;
    const department = buildDepartment(input, colleges, records, departmentId);
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
    <CollegeManagementContext.Provider value={{ colleges, departments, editingDepartmentId, setEditingDepartmentId, addCollege, createDepartment, updateDepartment }}>
      {children}
    </CollegeManagementContext.Provider>
  );
}

export function useCollegeManagement() {
  const context = useContext(CollegeManagementContext);
  if (!context) throw new Error("College management requires its directory layout.");
  return context;
}
