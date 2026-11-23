import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { getCurrentAccount } from "@/lib/auth/session";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Log in | PIT Enroll",
  description: "Log in to your Palompon Institute of Technology account.",
};

export default async function LoginPage() {
  const account = await getCurrentAccount();
  if (account) redirect(ROLE_HOME_PATHS[account.role]);

  return <LoginForm />;
}
