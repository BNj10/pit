import { validateDirectoryLogo } from "@/lib/department-management";
import type { College, CreateCollegeInput } from "@/types/college-management-types";

export function validateCollegeInput(
  input: CreateCollegeInput,
  colleges: readonly College[],
): Partial<Record<"name" | "code" | "logo", string>> {
  const errors: Partial<Record<"name" | "code" | "logo", string>> = {};
  const code = input.code.trim().toLowerCase();
  if (!input.name.trim()) errors.name = "Enter the official college name.";
  if (!code) errors.code = "Enter a college code.";
  else if (colleges.some((college) => college.code.trim().toLowerCase() === code)) {
    errors.code = "This college code is already in use. Enter a unique code.";
  }
  if (input.identity.kind === "logo") {
    const error = validateDirectoryLogo(input.identity.file);
    if (error) errors.logo = error;
  }
  return errors;
}

export function buildCollege(input: CreateCollegeInput, colleges: readonly College[]): College {
  const error = Object.values(validateCollegeInput(input, colleges))[0];
  if (error) throw new Error(error);

  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    code: input.code.trim(),
    description: input.description.trim(),
    icon: input.identity.kind === "icon" ? input.identity.icon : "building-2",
    logoUrl: input.identity.kind === "logo" ? URL.createObjectURL(input.identity.file) : undefined,
  };
}
