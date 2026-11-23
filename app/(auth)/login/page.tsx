import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getGoogleLoginErrorMessage } from "@/lib/auth/messages";
import { ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { getCurrentAccount } from "@/lib/auth/session";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Log in | PIT Enroll",
  description: "Log in to your Palompon Institute of Technology account.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const account = await getCurrentAccount();
  if (account) redirect(ROLE_HOME_PATHS[account.role]);

  const { error } = await searchParams;
  return <LoginForm initialError={getGoogleLoginErrorMessage(error)} />;
}
