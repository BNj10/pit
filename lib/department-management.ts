import type { College, Department, UpdateDepartmentInput } from "@/types/college-management-types";

export function validateDirectoryLogo(file: File): string | undefined {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "Choose a PNG, JPG, or WebP image.";
  if (file.size === 0 || file.size > 2 * 1024 * 1024) return "Choose a non-empty image no larger than 2 MB.";
}

export function validateDepartmentInput(
  input: UpdateDepartmentInput,
  colleges: readonly College[],
  departments: readonly Department[],
  departmentId?: string,
): Partial<Record<"college" | "name" | "code" | "logo", string>> {
  const errors: Partial<Record<"college" | "name" | "code" | "logo", string>> = {};
  if (!colleges.some((college) => college.id === input.collegeId)) errors.college = "Select a college for this department.";
  if (!input.name.trim()) errors.name = "Enter the official department name.";
  if (!input.code.trim()) errors.code = "Enter a department code.";
  else if (departments.some((department) => department.id !== departmentId && department.code.trim().toLowerCase() === input.code.trim().toLowerCase())) {
    errors.code = "This department code is already in use. Enter a unique code.";
  }
  if (input.identity?.kind === "logo") {
    const error = validateDirectoryLogo(input.identity.file);
    if (error) errors.logo = error;
  }
  return errors;
}

export function buildDepartment(
  input: UpdateDepartmentInput,
  colleges: readonly College[],
  departments: readonly Department[],
  departmentId?: string,
): Department {
  const existing = departments.find((department) => department.id === departmentId);
  if (departmentId !== undefined && !existing) throw new Error("This department no longer exists.");
  const error = Object.values(validateDepartmentInput(input, colleges, departments, departmentId))[0];
  if (error) throw new Error(error);
  if (!existing && !input.identity) throw new Error("Choose a department icon or logo.");

  return {
    id: existing?.id ?? crypto.randomUUID(),
    collegeId: input.collegeId,
    name: input.name.trim(),
    code: input.code.trim(),
    description: input.description.trim(),
    icon: input.identity?.kind === "icon" ? input.identity.icon : existing?.icon ?? "building-2",
    logoUrl: input.identity?.kind === "logo" ? URL.createObjectURL(input.identity.file)
      : input.identity?.kind === "icon" ? undefined : existing?.logoUrl,
  };
}
