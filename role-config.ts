import type { PortalNavigationItem, PortalRole, PortalRoleConfig } from "@/types/sidebar-types";

export const portalRoleConfig = {
  student: {
    label: "Student",
    audience: "STUDENT",
    navigationLabel: "STUDENT SERVICES",
    navigation: [
      { label: "Dashboard", href: "/student", icon: "dashboard", exact: true },
      { label: "Enrollment", href: "/student/enrollment", icon: "enrollment" },
      { label: "Subjects Enrolled", href: "/student/subjects-enrolled", icon: "subjects" },
      { label: "Academic Records", href: "/student/academic-records", icon: "records" },
      { label: "Instructor Evaluation", href: "/student/instructor-evaluation", icon: "evaluation" },
    ],
    account: { label: "Student Account", href: "/student/account" },
    support: { label: "Student support", description: "Help and advising", href: "/student/support" },
    logoutLabel: "Log out",
  },
  "department-chair": {
    label: "Department Chair",
    audience: "DEPARTMENT CHAIR",
    navigationLabel: "WORKSPACE",
    navigation: [
      { label: "Dashboard", href: "/department-chair", icon: "dashboard", exact: true },
      { label: "Curricula and Subjects", href: "/department-chair/curricula-and-subjects", icon: "curricula" },
      { label: "Student Records", href: "/department-chair/student-records", icon: "students" },
      { label: "Sections", href: "/department-chair/sections", icon: "sections" },
      { label: "Enrollment Management", href: "/department-chair/enrollment-management", icon: "enrollment-management" },
    ],
    account: { label: "Department Chair Account", href: "/department-chair/account" },
    support: { label: "Department Chair guide", href: "/department-chair/guide" },
    logoutLabel: "Logout",
  },
  dean: {
    label: "Dean",
    audience: "DEAN",
    navigationLabel: "WORKSPACE",
    navigation: [
      { label: "Dashboard", href: "/dean", icon: "dashboard", exact: true },
      { label: "Colleges & Departments", href: "/dean/colleges-and-departments", icon: "colleges" },
      { label: "Faculty Evaluation", href: "/dean/faculty-evaluation", icon: "faculty-evaluation" },
    ],
    account: { label: "Dean Account", href: "/dean/account" },
    support: { label: "Dean guide", href: "/dean/guide" },
    logoutLabel: "Logout",
  },
} as const satisfies Record<PortalRole, PortalRoleConfig>;

function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

export function isPortalPathActive(pathname: string, href: string, exact = false) {
  const path = normalizePath(pathname);
  const target = normalizePath(href);

  return path === target || (!exact && path.startsWith(`${target}/`));
}

export function getActivePortalItem(
  pathname: string,
  navigation: readonly PortalNavigationItem[],
) {
  return navigation
    .filter((item) => isPortalPathActive(pathname, item.href, item.exact))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
