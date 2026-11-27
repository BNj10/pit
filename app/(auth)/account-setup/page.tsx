import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { getAccountEntryPath, getCurrentAccount, isMissingStudentId } from "@/lib/auth/session";

import { AccountSetupForm } from "./components/account-setup-form";

export const metadata: Metadata = {
  title: "Set up your account | PIT Enroll",
  description: "Choose a password to finish setting up your account.",
};

export default async function AccountSetupPage() {
  const account = await getCurrentAccount();
  if (!account) redirect(LOGIN_PATH);
  if (account.setupComplete) redirect(getAccountEntryPath(account));

  return (
    <AccountSetupForm
      studentId={account.studentId}
      missingStudentId={isMissingStudentId(account)}
    />
  );
}
