"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { collegeManagementPreview } from "@/types/college-management-exports";
import { useCollegeManagement } from "../../../../components/college-management-provider";
import { DepartmentStudents } from "./components/department-students";

export default function DepartmentStudentsPage({ params }: { params: Promise<{ collegeId: string; departmentId: string }> }) {
  const { collegeId, departmentId } = use(params);
  const { colleges, departments } = useCollegeManagement();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const department = departments.find((item) => item.id === departmentId && item.collegeId === collegeId);
  if (!colleges.some((college) => college.id === collegeId) || !department) notFound();
  const students = collegeManagementPreview.students.filter((student) => student.departmentId === departmentId);
  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  return (
    <>
      <DepartmentStudents department={department} students={students} onViewAccount={setSelectedStudentId} />
      <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => { if (!open) setSelectedStudentId(null); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student account</DialogTitle>
            <DialogDescription>{department.name}</DialogDescription>
          </DialogHeader>
          {selectedStudent && <dl className="space-y-4 text-sm">
            {[
              ["Name", selectedStudent.name],
              ["University email", selectedStudent.email],
              ["Student ID", selectedStudent.studentNumber],
              ["Year standing", `Year ${selectedStudent.yearStanding}`],
              ["Batch", selectedStudent.batch],
            ].map(([label, value]) => <div key={label} className="space-y-1"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
          </dl>}
        </DialogContent>
      </Dialog>
    </>
  );
}
