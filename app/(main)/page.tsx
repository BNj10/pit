import { redirect } from "next/navigation";

import { LOGIN_PATH, ROLE_HOME_PATHS } from "@/lib/auth/routes";
import { getCurrentAccount } from "@/lib/auth/session";

export default async function Home() {
  const account = await getCurrentAccount();

  redirect(account ? ROLE_HOME_PATHS[account.role] : LOGIN_PATH);
}
