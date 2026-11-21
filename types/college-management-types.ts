export type DirectoryIconName =
  | "building-2" | "graduation-cap" | "book-open" | "flask-conical"
  | "cpu" | "palette" | "briefcase" | "heart-pulse" | "concierge-bell"
  | "zap" | "cog" | "wrench" | "monitor";

export interface College {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: DirectoryIconName;
  logoUrl?: string;
}

export interface Department {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  description: string;
  icon: DirectoryIconName;
  logoUrl?: string;
}

export interface DepartmentStudent {
  id: string;
  departmentId: string;
  name: string;
  initials: string;
  email: string;
  studentNumber: string;
  yearStanding: number;
  batch: string;
}

export interface DepartmentFacultyMember {
  id: string;
  departmentId: string;
  name: string;
  initials: string;
  academicRank: string;
}

export interface CollegesDirectoryProps {
  colleges: readonly College[];
  onAddCollege: () => void;
  onManageDepartments: (collegeId: string) => void;
}

export interface DepartmentsDirectoryProps {
  college: College;
  departments: readonly Department[];
  onCreateDepartment: () => void;
  onEditDepartment: (departmentId: string) => void;
  onViewFaculty: (departmentId: string) => void;
  onViewStudents: (departmentId: string) => void;
}

export interface DepartmentStudentsProps {
  department: Department;
  students: readonly DepartmentStudent[];
  onViewAccount: (studentId: string) => void;
}

export interface DepartmentFacultyProps {
  department: Department;
  faculty: readonly DepartmentFacultyMember[];
}

export type DirectoryIdentity =
  | { kind: "icon"; icon: DirectoryIconName }
  | { kind: "logo"; file: File };

export interface CreateCollegeInput {
  name: string;
  code: string;
  description: string;
  identity: DirectoryIdentity;
}

export interface CollegeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colleges: readonly College[];
  onSave: (input: CreateCollegeInput) => Promise<void>;
}

export interface DirectoryIdentityFieldProps {
  /** Prefix for element IDs, matching the owning dialog's field IDs. */
  id: string;
  subject: "college" | "department";
  editing?: boolean;
  icon: DirectoryIconName;
  logoUrl?: string;
  logoName?: string;
  error?: string;
  disabled?: boolean;
  onIconSelect: (icon: DirectoryIconName) => void;
  onLogoSelect: (file: File) => void;
  onLogoRemove: () => void;
}

export interface CreateDepartmentInput {
  collegeId: string;
  name: string;
  code: string;
  description: string;
  identity: DirectoryIdentity;
}

export interface UpdateDepartmentInput extends Omit<CreateDepartmentInput, "identity"> {
  // Omit identity to retain an existing logo when editing details.
  identity?: DirectoryIdentity;
}

export type DepartmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colleges: readonly College[];
  departments: readonly Department[];
} & (
  | { department?: undefined; defaultCollegeId?: string; onSave: (input: CreateDepartmentInput) => Promise<void> }
  | { department: Department; defaultCollegeId?: never; onSave: (input: UpdateDepartmentInput) => Promise<void> }
);

export interface DirectorySearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export interface DirectorySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}

export interface DirectoryPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPageChange: (page: number) => void;
}
