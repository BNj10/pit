import type { Metadata } from "next";

import { SetNewPasswordForm } from "./components/set-new-password-form";

export const metadata: Metadata = {
  title: "Set a new password | PIT Enroll",
  description: "Create a new password for your university account.",
};

export default function SetNewPasswordPage() {
  return <SetNewPasswordForm />;
}
