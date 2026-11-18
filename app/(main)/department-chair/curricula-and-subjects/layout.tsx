import type { ReactNode } from "react";

import { curriculumManagementPreview } from "@/types/curriculum-mocks";
import { CurriculaProvider } from "./components/curricula-provider";
import "./curricula-and-subjects.css";

// Shares preview curricula, subjects, and styles across the list and subjects pages.
export default function CurriculaAndSubjectsLayout({ children }: { children: ReactNode }) {
  return <CurriculaProvider data={curriculumManagementPreview}>{children}</CurriculaProvider>;
}
