import type { AccountProfileDetails } from "./account-types";

/** Read-only academic information maintained by the Administrator. */
export interface DepartmentChairAcademicInformation {
  department: string | null;
  academicRank: string | null;
  employmentStatus: string | null;
  facultyId: string | null;
}

export interface DepartmentChairAccount {
  academic: DepartmentChairAcademicInformation;
  profile: AccountProfileDetails;
}
