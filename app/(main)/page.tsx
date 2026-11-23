import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { getAccountEntryPath, getCurrentAccount } from "@/lib/auth/session";

export default async function Home() {
  const account = await getCurrentAccount();

  redirect(account ? getAccountEntryPath(account) : LOGIN_PATH);
}
