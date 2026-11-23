import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { getAccountEntryPath, getCurrentAccount } from "@/lib/auth/session";

import { AccountSetupForm } from "./components/account-setup-form";

export const metadata: Metadata = {
  title: "Set up your account | PIT Enroll",
  description: "Choose a password and add your student ID.",
};

export default async function AccountSetupPage() {
  const account = await getCurrentAccount();
  if (!account) redirect(LOGIN_PATH);
  if (account.setupComplete) redirect(getAccountEntryPath(account));

  return (
    <AccountSetupForm
      email={account.email}
      role={account.role}
      studentId={account.studentId}
    />
  );
}
