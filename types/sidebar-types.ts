import type { ReactNode } from "react";

export type PortalRole = "student" | "department-chair" | "dean";

export type PortalNavigationIcon =
  | "dashboard"
  | "enrollment"
  | "subjects"
  | "records"
  | "evaluation"
  | "curricula"
  | "students"
  | "sections"
  | "enrollment-management"
  | "colleges"
  | "faculty-evaluation";

export interface PortalNavigationItem {
  label: string;
  href: string;
  icon: PortalNavigationIcon;
  exact?: boolean;
}

export interface PortalSupportLink {
  label: string;
  href: string;
  description?: string;
}

export interface PortalRoleConfig {
  label: string;
  audience: string;
  navigationLabel: string;
  navigation: readonly PortalNavigationItem[];
  account: { label: string; href: string };
  support: PortalSupportLink;
  logoutLabel: string;
}

export interface PortalUser {
  name: string;
  description: string;
  initials?: string;
  avatarUrl?: string;
}

export interface PortalProfileProps {
  user: PortalUser;
  account: PortalRoleConfig["account"];
  onNavigate?: () => void;
}

export interface PortalSidebarProps {
  role: PortalRole;
  user: PortalUser;
  activeTerm: string;
  config?: PortalRoleConfig;
  /** Optional account link in the mobile navigation; the profile footer uses config.account. */
  account?: PortalRoleConfig["account"];
  onLogout?: () => void | Promise<void>;
  className?: string;
}

export interface PortalLayoutProps extends PortalSidebarProps {
  children: ReactNode;
  header?: ReactNode;
}
