import type { Metadata } from "next";

import { enrollmentPreview } from "@/types/enrollment-mocks";
import { EnrollmentContent } from "./components/enrollment-content";

export const metadata: Metadata = {
  title: "Enrollment | University Portal",
};

export default function EnrollmentPage() {
  // Replace the fixture at this boundary when authenticated enrollment data is connected.
  return <EnrollmentContent {...enrollmentPreview} />;
}
