import type { Metadata } from "next";

import { WelcomePanel } from "../components/welcome-panel";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | PIT Enroll",
  description: "Recover access to your Palompon Institute of Technology account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] bg-card lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto]">
      <WelcomePanel />
      <main className="flex min-w-0 items-start justify-center px-6 py-10 sm:items-center sm:px-10 sm:py-14 lg:px-20 lg:py-[42px]">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
