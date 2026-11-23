"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { DepartmentDialog } from "../components/department-dialog";
import { useCollegeManagement } from "../components/college-management-provider";
import { DepartmentsDirectory } from "./components/departments-directory";

export default function DepartmentsPage({ params }: { params: Promise<{ collegeId: string }> }) {
  const { collegeId } = use(params);
  const router = useRouter();
  const { colleges, departments, editingDepartmentId, setEditingDepartmentId, createDepartment, updateDepartment } = useCollegeManagement();
  const [addingDepartment, setAddingDepartment] = useState(false);
  const editingDepartment = departments.find((department) => department.id === editingDepartmentId && department.collegeId === collegeId);

  useEffect(() => () => setEditingDepartmentId(null), [setEditingDepartmentId]);

  const college = colleges.find((item) => item.id === collegeId);
  if (!college) notFound();
  const collegePath = `/dean/colleges-and-departments/${encodeURIComponent(collegeId)}`;

  return (
    <>
      <DepartmentsDirectory
        college={college}
        departments={departments}
        onCreateDepartment={() => setAddingDepartment(true)}
        onEditDepartment={setEditingDepartmentId}
        onViewFaculty={(departmentId) => router.push(`${collegePath}/departments/${encodeURIComponent(departmentId)}/faculty`)}
        onViewStudents={(departmentId) => router.push(`${collegePath}/departments/${encodeURIComponent(departmentId)}/students`)}
      />
      <DepartmentDialog open={addingDepartment} onOpenChange={setAddingDepartment} colleges={colleges} departments={departments} defaultCollegeId={collegeId} onSave={async (input) => {
        await createDepartment(input);
        if (input.collegeId !== collegeId) router.push(`/dean/colleges-and-departments/${encodeURIComponent(input.collegeId)}`);
      }} />
      {editingDepartment && <DepartmentDialog
        key={editingDepartment.id}
        open
        onOpenChange={(open) => { if (!open) setEditingDepartmentId(null); }}
        colleges={colleges}
        departments={departments}
        department={editingDepartment}
        onSave={async (input) => {
          await updateDepartment(editingDepartment.id, input);
          setEditingDepartmentId(null);
          if (input.collegeId !== collegeId) router.push(`/dean/colleges-and-departments/${encodeURIComponent(input.collegeId)}`);
        }}
      />}
    </>
  );
}
