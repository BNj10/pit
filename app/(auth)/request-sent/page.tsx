import type { Metadata } from "next";

import { ResetRequestSent } from "./components/reset-request-sent";

export const metadata: Metadata = {
  title: "Check your email | PIT Enroll",
  description: "Next steps for recovering access to your university account.",
};

export default function ResetRequestSentPage() {
  return <ResetRequestSent />;
}
