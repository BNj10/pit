import type { Metadata } from "next";

import { DeanAccount } from "./components/dean-account";

export const metadata: Metadata = {
  title: "College Dean Account | PIT Enroll",
  description: "Your personal profile and contact information.",
};

export default function DeanAccountPage() {
  return <DeanAccount />;
}
