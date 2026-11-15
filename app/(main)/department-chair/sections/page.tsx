import type { Metadata } from "next";

import { sectionsPreview } from "@/types/sections-exports";
import { SectionsManager } from "./components/sections-manager";

export const metadata: Metadata = {
  title: "Sections | PIT Enroll",
  description: "Schedule section offerings for approved curriculum subjects.",
};

export default function DepartmentChairSectionsPage() {
  return <SectionsManager data={sectionsPreview} />;
}
