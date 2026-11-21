import type { Metadata } from "next";

import { AcademicYears } from "../components/academic-years";

export const metadata: Metadata = {
  title: "Academic Years & Terms | PIT Enroll",
  description: "Create academic years and their terms, and start each term.",
};

export default function DeanAcademicYearsPage() {
  return <AcademicYears />;
}
