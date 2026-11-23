export interface ApprovedSubject {
  code: string;
  title: string;
  section: string;
  classrooms: readonly string[];
  instructor: string | null;
  lectureUnits: number;
  labUnits: number;
}

export interface SubjectsEnrolledData {
  subjects: readonly ApprovedSubject[];
  term: string;
}
