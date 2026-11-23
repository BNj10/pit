import type { AccountProfileDetails } from "./account-types";

export interface StudentAccount {
  readonly name: string;
  readonly initials: string;
  readonly studentId: string;
  readonly program: string;
  readonly status: string;
  readonly batch: string;
  readonly yearLevel: string;
  /** Initial editable details; saved edits live in the portal AccountProvider. */
  profile: AccountProfileDetails;
}
