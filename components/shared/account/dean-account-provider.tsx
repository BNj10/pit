"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { deanProfilePreview } from "@/types/dean-account-mocks";
import type { DeanProfileDetails } from "@/types/dean-account-types";
import type { PortalUser } from "@/types/sidebar-types";

const DeanAccountContext = createContext<{
  user: PortalUser;
  details: DeanProfileDetails;
  saveDetails: (details: DeanProfileDetails) => void;
} | null>(null);

// Preview state lasts while the portal is open. Persist through an authenticated
// account service when one is available; passwords never belong in this state.
export function DeanAccountProvider({ user, children }: { user: PortalUser; children: ReactNode }) {
  const [details, setDetails] = useState<DeanProfileDetails>({
    ...deanProfilePreview,
    avatarUrl: deanProfilePreview.avatarUrl ?? user.avatarUrl ?? null,
  });

  return (
    <DeanAccountContext.Provider value={{ user: { ...user, avatarUrl: details.avatarUrl ?? undefined }, details, saveDetails: setDetails }}>
      {children}
    </DeanAccountContext.Provider>
  );
}

export function useDeanAccount() {
  const account = useContext(DeanAccountContext);
  if (!account) throw new Error("Dean account controls require DeanAccountProvider.");
  return account;
}
