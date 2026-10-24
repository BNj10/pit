import type { Metadata } from "next";

import { PasswordUpdated } from "./components/password-updated";

export const metadata: Metadata = {
  title: "Password updated | PIT Enroll",
  description: "Log in to your university account with your new password.",
};

export default function PasswordUpdatedPage() {
  return <PasswordUpdated />;
}
