import type { Metadata } from "next";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Log in | PIT Enroll",
  description: "Log in to your Palompon Institute of Technology account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
