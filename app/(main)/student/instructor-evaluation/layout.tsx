import type { ReactNode } from "react";

import { instructorEvaluationPreview } from "@/types/instructor-evaluation-exports";
import { InstructorEvaluationProvider } from "./components/instructor-evaluation-provider";

export default function InstructorEvaluationLayout({ children }: { children: ReactNode }) {
  // The list and detail routes share preview submission status across navigation.
  // App Router layouts cannot pass props to route children, so context stays scoped here.
  return (
    <InstructorEvaluationProvider {...instructorEvaluationPreview}>
      {children}
    </InstructorEvaluationProvider>
  );
}
