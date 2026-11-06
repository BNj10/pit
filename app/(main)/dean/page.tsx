import type { Metadata } from "next";

import { deanDashboardPreview } from "@/types/dean-dashboard-exports";
import { DeanDashboard } from "./components/dean-dashboard";

export const metadata: Metadata = {
  title: "Dean Dashboard | University Portal",
};

export default function DeanPage() {
  return <DeanDashboard data={deanDashboardPreview} />;
}
