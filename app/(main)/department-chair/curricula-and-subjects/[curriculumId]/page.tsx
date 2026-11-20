import type { Metadata } from "next";

import { CurriculumSubjects } from "./components/curriculum-subjects";

export const metadata: Metadata = {
  title: "Curriculum Subjects | PIT Enroll",
  description: "View and manage a curriculum's subjects by year level and semester.",
};

// The curriculum is looked up in the shared preview state, which also holds
// curricula created during this session; the client shows a not-found state.
export default async function CurriculumSubjectsPage({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = await params;
  return <CurriculumSubjects curriculumId={decodeURIComponent(curriculumId)} />;
}
