"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { collegeManagementPreview } from "@/types/college-management-exports";
import { useCollegeManagement } from "../../../../components/college-management-provider";
import { DepartmentFaculty } from "./components/department-faculty";

export default function DepartmentFacultyPage({ params }: { params: Promise<{ collegeId: string; departmentId: string }> }) {
  const { collegeId, departmentId } = use(params);
  const { colleges, departments } = useCollegeManagement();
  const department = departments.find((item) => item.id === departmentId && item.collegeId === collegeId);
  if (!colleges.some((college) => college.id === collegeId) || !department) notFound();

  return <DepartmentFaculty
    department={department}
    faculty={collegeManagementPreview.faculty.filter((member) => member.departmentId === departmentId)}
  />;
}
