import type { Metadata } from "next";

import { ForgotPasswordForm } from "./components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | PIT Enroll",
  description: "Recover access to your Palompon Institute of Technology account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
