import type { Metadata } from "next";

import { CurriculumManagement } from "./components/curriculum-management";

export const metadata: Metadata = {
  title: "Curricula and Subjects | PIT Enroll",
  description: "Create curricula, manage their subjects, and control their lifecycle.",
};

export default function CurriculaAndSubjectsPage() {
  return (
    <CurriculumManagement>
      <section className="curriculum-status-guide" aria-labelledby="curriculum-status-guide-title">
        <h3 id="curriculum-status-guide-title">Manage curriculum status</h3>
        <p>
          Use Activate on a draft to make it available. Deactivate returns an active curriculum to draft. Archived
          curricula are read-only until restored to draft.
        </p>
      </section>
    </CurriculumManagement>
  );
}
