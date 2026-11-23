import type { Metadata } from "next";

import { subjectsEnrolledPreview } from "@/types/subjects-enrolled-exports";

import { ApprovedSubjectsTable } from "./components/approved-subjects-table";

export const metadata: Metadata = {
  title: "Subjects Enrolled | University Portal",
};

export default function SubjectsEnrolledPage() {
  // Replace the fixture at this boundary when authenticated enrollment data is connected.
  // Use notYetEnrolledPreview to preview the not-enrolled state.
  return <ApprovedSubjectsTable {...subjectsEnrolledPreview} />;
}
