"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { AccountProfileDetails } from "@/types/account-types";
import type { PortalUser } from "@/types/sidebar-types";

const AccountContext = createContext<{
  user: PortalUser;
  details: AccountProfileDetails;
  saveDetails: (details: AccountProfileDetails) => void;
} | null>(null);

// Shared by every portal that has an account page. Preview state lasts while
// the portal is open, so saved edits survive moving between the account and
// edit-profile routes and the sidebar shows the saved photo. Persist through an
// authenticated account service when one is available; passwords never belong
// in this state.
export function AccountProvider({ user, initialDetails, children }: {
  user: PortalUser;
  initialDetails: AccountProfileDetails;
  children: ReactNode;
}) {
  const [details, setDetails] = useState<AccountProfileDetails>({
    ...initialDetails,
    avatarUrl: initialDetails.avatarUrl ?? user.avatarUrl ?? null,
  });

  return (
    <AccountContext.Provider value={{ user: { ...user, avatarUrl: details.avatarUrl ?? undefined }, details, saveDetails: setDetails }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("Account controls require AccountProvider.");
  return account;
}
