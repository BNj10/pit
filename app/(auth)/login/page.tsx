import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getLoginErrorMessage } from "@/lib/auth/messages";
import { getAccountEntryPath, getCurrentAccount } from "@/lib/auth/session";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Log in | PIT Enroll",
  description: "Log in to your Palompon Institute of Technology account.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const account = await getCurrentAccount();
  if (account) redirect(getAccountEntryPath(account));

  const { error } = await searchParams;
  return <LoginForm initialError={getLoginErrorMessage(error)} />;
}
