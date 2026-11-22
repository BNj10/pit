import type { Metadata } from "next";

import { notYetEnrolledPreview } from "@/types/subjects-enrolled-exports";

import { ApprovedSubjectsTable } from "./components/approved-subjects-table";

export const metadata: Metadata = {
  title: "Subjects Enrolled | University Portal",
};

export default function SubjectsEnrolledPage() {
  return <ApprovedSubjectsTable {...notYetEnrolledPreview} />;
}
