/** Editable College Dean profile details. Identity fields come from the portal user. */
export interface DeanProfileDetails {
  currentAddress: string;
  permanentAddress: string;
  email: string;
  mobile: string;
  /** Image data or URL; null shows the initials fallback. */
  avatarUrl: string | null;
}
