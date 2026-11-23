export type CurriculumStatus = "Draft" | "Active" | "Archived";

/** The degree program a Department Chair is assigned to manage. */
export interface DegreeProgram {
  id: string;
  /** Short code used to build curriculum codes, e.g. "BSCS". */
  code: string;
  name: string;
  /** Abbreviated name, e.g. "BS Computer Science". */
  shortName: string;
  /** Number of year levels a curriculum in this program spans. */
  yearLevels: number;
}

export interface Curriculum {
  id: string;
  name: string;
  /** The curriculum's own year; unique within its degree program. */
  year: number;
  /** Year the curriculum takes effect, as entered; may be years after `year`. It has no end year. */
  implementedYear: number;
  status: CurriculumStatus;
  description: string | null;
}

export type Semester = "first" | "second" | "summer";

export interface CurriculumTerm {
  yearLevel: number;
  semester: Semester;
}

export interface Subject extends CurriculumTerm {
  id: string;
  curriculumId: string;
  /** Normalized code, unique within its curriculum, e.g. "CC 101". */
  code: string;
  title: string;
  lectureUnits: number;
  laboratoryUnits: number;
  /** Always lectureUnits + laboratoryUnits: the subject's total weekly contact hours at 1 unit = 1 hour. */
  units: number;
  /** Subjects in earlier terms of the same curriculum. */
  prerequisiteIds: readonly string[];
  /** Subjects in the same term; the relation is mutual. */
  corequisiteIds: readonly string[];
}

export interface CurriculumManagementData {
  program: DegreeProgram;
  curricula: readonly Curriculum[];
  subjects: readonly Subject[];
}

/** Raw text values from the add and edit curriculum forms. */
export interface CurriculumFormValues {
  name: string;
  year: string;
  implementedYear: string;
  description: string;
}

export type CurriculumDetails = Pick<Curriculum, "name" | "year" | "implementedYear" | "description">;

export type CurriculumFormErrors = Partial<Record<keyof CurriculumFormValues, string>>;

export type CurriculumTransition = "activate" | "deactivate" | "restore";

/** Raw values from the add and edit subject forms. */
export interface SubjectFormValues extends CurriculumTerm {
  code: string;
  title: string;
  lectureUnits: string;
  laboratoryUnits: string;
  prerequisiteIds: readonly string[];
  corequisiteIds: readonly string[];
}

export type SubjectDetails = Omit<Subject, "id" | "curriculumId">;

/** Another subject that lists a subject among its requisites. */
export interface SubjectDependent {
  subject: Subject;
  relation: "prerequisite" | "corequisite";
}

export type SubjectFormErrors = Partial<
  Record<"code" | "title" | "term" | "lectureUnits" | "laboratoryUnits" | "prerequisiteIds" | "corequisiteIds", string>
>;

export interface CurriculaContextValue {
  program: DegreeProgram;
  curricula: readonly Curriculum[];
  subjects: readonly Subject[];
  createCurriculum: (details: CurriculumDetails) => Curriculum;
  updateCurriculum: (id: string, change: Partial<CurriculumDetails> | Pick<Curriculum, "status">) => void;
  /** Permanently removes the curriculum and every subject under it. */
  deleteCurriculum: (id: string) => void;
  addSubject: (curriculumId: string, details: SubjectDetails) => Subject;
  updateSubject: (id: string, details: SubjectDetails) => void;
  deleteSubject: (id: string) => void;
}
