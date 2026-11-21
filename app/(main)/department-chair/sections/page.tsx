import type { Metadata } from "next";

import { sectionsCurriculumData } from "@/lib/sections";
import { curriculumManagementPreview } from "@/types/curriculum-mocks";
import { sectionsPreview } from "@/types/sections-exports";
import { SectionsManager } from "./components/sections-manager";

export const metadata: Metadata = {
  title: "Sections | PIT Enroll",
  description: "Schedule section offerings for subjects of active curricula.",
};

export default function DepartmentChairSectionsPage() {
  // Preview data. Scoping happens here on the server, so draft curricula never reach the browser;
  // a server-only query for the chair's program can replace both fixtures later.
  const data = {
    ...sectionsPreview,
    ...sectionsCurriculumData(curriculumManagementPreview, sectionsPreview.offerings),
  };
  return <SectionsManager data={data} />;
}
