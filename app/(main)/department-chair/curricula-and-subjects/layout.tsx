import type { ReactNode } from "react";

import { curriculumManagementPreview } from "@/types/curriculum-mocks";
import { CurriculaProvider } from "./components/curricula-provider";

// Shares preview curricula and subjects across the list and subjects pages.
export default function CurriculaAndSubjectsLayout({ children }: { children: ReactNode }) {
  return <CurriculaProvider data={curriculumManagementPreview}>{children}</CurriculaProvider>;
}
