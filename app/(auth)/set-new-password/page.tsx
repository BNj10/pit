import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { getCurrentAccount } from "@/lib/auth/session";

import { SetNewPasswordForm } from "./components/set-new-password-form";

export const metadata: Metadata = {
  title: "Set a new password | PIT Enroll",
  description: "Create a new password for your university account.",
};

export default async function SetNewPasswordPage() {
  // The password-reset email link signs the user in before opening this page.
  const account = await getCurrentAccount();
  if (!account) redirect(`${LOGIN_PATH}?error=link-expired`);

  return <SetNewPasswordForm />;
}
