import type { College, Department } from "@/types/college-management-types";
import type { PortalBreadcrumbItem } from "@/types/sidebar-types";

export function getCollegeManagementBreadcrumbs(
  pathname: string,
  colleges: readonly College[],
  departments: readonly Department[],
  editingDepartmentId: string | null = null,
): PortalBreadcrumbItem[] {
  const basePath = "/dean/colleges-and-departments";
  const breadcrumbs = [
    { label: "Dean", href: "/dean" },
    { label: "Colleges & Departments", href: basePath },
  ];
  const segments = pathname.slice(basePath.length).split("/").filter(Boolean);
  const college = colleges.find((item) => encodeURIComponent(item.id) === segments[0]);
  if (!college) return breadcrumbs;

  const collegePath = `${basePath}/${encodeURIComponent(college.id)}`;
  breadcrumbs.push({ label: college.name, href: collegePath });
  const editing = segments.length === 1 && editingDepartmentId !== null;
  const department = departments.find((item) => item.collegeId === college.id && (
    editing ? item.id === editingDepartmentId : segments[1] === "departments" && encodeURIComponent(item.id) === segments[2]
  ));

  if (!department) return breadcrumbs;

  breadcrumbs.push({ label: department.name.replace(/\s+Department$/i, ""), href: `${collegePath}/departments/${encodeURIComponent(department.id)}` });
  const view = editing ? "Edit" : segments[3] === "students" ? "Student" : segments[3] === "faculty" ? "Faculty" : null;
  if (view) breadcrumbs.push({ label: view, href: pathname });
  return breadcrumbs;
}
