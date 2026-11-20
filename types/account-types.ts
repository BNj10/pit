/**
 * Editable profile details shared by every portal account page. Identity and
 * role-specific records (such as academic information) are read-only and come
 * from the portal user or the role's own account data.
 */
export interface AccountProfileDetails {
  currentAddress: string;
  permanentAddress: string;
  email: string;
  mobile: string;
  /** Image data or URL; null shows the initials fallback. */
  avatarUrl: string | null;
}
