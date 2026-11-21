"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCollegeManagement } from "./components/college-management-provider";
import { CollegesDirectory } from "./components/colleges-directory";
import { CollegeDialog } from "./components/college-dialog";

export default function CollegesAndDepartmentsPage() {
  const router = useRouter();
  const { colleges, createCollege } = useCollegeManagement();
  const [addingCollege, setAddingCollege] = useState(false);

  return (
    <>
      <CollegesDirectory
        colleges={colleges}
        onAddCollege={() => setAddingCollege(true)}
        onManageDepartments={(collegeId) => router.push(`/dean/colleges-and-departments/${encodeURIComponent(collegeId)}`)}
      />
      <CollegeDialog open={addingCollege} onOpenChange={setAddingCollege} colleges={colleges} onSave={createCollege} />
    </>
  );
}
