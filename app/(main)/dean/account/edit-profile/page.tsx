import type { Metadata } from "next";

import { DeanAccount } from "../components/dean-account";

export const metadata: Metadata = {
  title: "Edit Profile | PIT Enroll",
  description: "Update your College Dean address and contact details.",
};

export default function EditDeanProfilePage() {
  return <DeanAccount editing />;
}
