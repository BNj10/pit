export interface EnrollmentOffering {
  id: string;
  code: string;
  title: string;
  department: string;
  section: string;
  schedule: string;
  rooms: string;
  lectureUnits: number;
  labUnits: number;
}

export interface EnrollmentData {
  term: string;
  unitLimit: number;
  offerings: readonly EnrollmentOffering[];
  initialEnrollmentIds: readonly string[];
  initialSelectedIds: readonly string[];
}
