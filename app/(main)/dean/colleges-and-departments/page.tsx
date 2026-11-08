"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCollegeManagement } from "./components/college-management-provider";
import { CollegesDirectory } from "./components/colleges-directory";
import { DirectoryDetailsDialog } from "./components/directory-details-dialog";

export default function CollegesAndDepartmentsPage() {
  const router = useRouter();
  const { colleges, addCollege } = useCollegeManagement();
  const [addingCollege, setAddingCollege] = useState(false);

  return (
    <>
      <CollegesDirectory
        colleges={colleges}
        onAddCollege={() => setAddingCollege(true)}
        onManageDepartments={(collegeId) => router.push(`/dean/colleges-and-departments/${encodeURIComponent(collegeId)}`)}
      />
      {addingCollege && <DirectoryDetailsDialog open onOpenChange={setAddingCollege} kind="college" onSave={addCollege} />}
    </>
  );
}
