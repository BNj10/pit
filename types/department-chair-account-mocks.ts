import type { DepartmentChairAccount } from "./department-chair-account-types";

// Synthetic design preview. Replace with the authenticated Department Chair's
// account; null values show "Not assigned".
export const departmentChairAccountPreview = {
  academic: {
    department: "Department of Information Technology",
    academicRank: "Instructor I",
    employmentStatus: null,
    facultyId: null,
  },
  profile: {
    currentAddress: "",
    permanentAddress: "",
    email: "",
    mobile: "",
    avatarUrl: null,
  },
} satisfies DepartmentChairAccount;
