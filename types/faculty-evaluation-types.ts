export type EvaluationAudience = "student" | "department-chair" | "dean";
/** Raters who use the supervisor instrument and its benchmark statements. */
export type SupervisorEvaluationAudience = Exclude<EvaluationAudience, "student">;
export type EvaluationSemester = "first" | "second";
export type EvaluationWindowStatus = "Open" | "Scheduled" | "Closed";

export interface EvaluationWindow {
  academicYear: string;
  semester: EvaluationSemester;
  /**
   * The school-time day evaluations start ("YYYY-MM-DD"). Windows have no end
   * date: they stay open until the dean closes them.
   */
  opensAt: string;
  manuallyClosed: boolean;
}

export interface EvaluationInstructor {
  id: string;
  name: string;
  department: string;
  rank: string;
  subject: string;
}

export interface EvaluationCriterion {
  id: string;
  section: string;
  statement: string;
  supervisorStatement?: string;
  verification?: string;
}

export interface EvaluationSubmission {
  term: string;
  instructorId: string;
  audience: EvaluationAudience;
  ratings: Readonly<Record<string, number>>;
  comments: string;
}

export interface EvaluationInstructorResult {
  /** Faculty details captured for this completed term. */
  instructor: EvaluationInstructor;
  responseCount: number;
  studentScore: number | null;
  departmentChairScore: number | null;
  deanScore: number | null;
}

export interface EvaluationTermResult {
  id: string;
  academicYear: string;
  semester: EvaluationSemester;
  facultyCount: number;
  responseCount: number;
  studentScore: number | null;
  /** Department Chair SEF and College Dean SEF are reported separately, never combined. */
  departmentChairScore: number | null;
  deanScore: number | null;
  instructorResults?: readonly EvaluationInstructorResult[];
}

export interface EvaluationClassResult {
  id: string;
  code: string;
  title: string;
  section: string;
  responses: number;
  enrolled: number;
  /** Sum of the respondents' normalized scores, before rounding the class average. */
  totalScore: number;
}

export interface EvaluationSupervisorResult {
  ratings: Readonly<Record<string, number>>;
  comments: readonly string[];
}

export interface SupervisorEvaluationProps {
  instructor: EvaluationInstructor;
  audience: SupervisorEvaluationAudience;
  title: string;
  /** Where the evaluator returns after submitting or when going back. */
  listHref: string;
  listLabel: string;
}

export type DepartmentChairEvaluationStatusFilter = "all" | "pending" | "evaluated";

export interface DepartmentChairEvaluationProps {
  /** Preview fixture; production must resolve this from the chair's verified session. */
  department: string;
}

export interface DepartmentChairEvaluationResultProps {
  instructor: EvaluationInstructor;
}

export interface FacultyEvaluationReport {
  instructorId: string;
  term: string;
  classes: readonly EvaluationClassResult[];
  departmentChair: EvaluationSupervisorResult | null;
  studentComments: readonly string[];
}

export interface FacultyEvaluationDocument {
  instructor: EvaluationInstructor;
  term: Pick<EvaluationWindow, "academicYear" | "semester">;
  classes: readonly EvaluationClassResult[];
  criteria: readonly EvaluationCriterion[];
  departmentChair: EvaluationSupervisorResult | null;
  collegeDean: EvaluationSupervisorResult | null;
  studentComments: readonly string[];
  /** Archived totals do not provide benchmark ratings or a class breakdown. */
  archivedSummary?: Pick<
    EvaluationInstructorResult,
    "responseCount" | "studentScore" | "departmentChairScore" | "deanScore"
  >;
}

export interface FacultyEvaluationData {
  /** null until the dean creates the first evaluation window. */
  window: EvaluationWindow | null;
  academicYears: readonly string[];
  currentAcademicYear?: string;
  departments: readonly string[];
  instructors: readonly EvaluationInstructor[];
  criteria: readonly EvaluationCriterion[];
  results: readonly EvaluationTermResult[];
  submissions?: readonly EvaluationSubmission[];
  reports?: readonly FacultyEvaluationReport[];
}

export interface EvaluationContextValue {
  data: FacultyEvaluationData;
  /** null when no evaluation window has been created yet; status is then "Closed". */
  window: EvaluationWindow | null;
  status: EvaluationWindowStatus | null;
  submissions: readonly EvaluationSubmission[];
  /** Completed terms, including any window closed during this session and archived terms. */
  results: readonly EvaluationTermResult[];
  /** Results hidden from the history list; their data is kept and can be restored. */
  archivedResultIds: readonly string[];
  saveWindow: (window: EvaluationWindow) => string | null;
  /** Closes the window; returns an error message while any evaluation entry is missing. */
  closeWindow: () => string | null;
  archiveResult: (resultId: string) => void;
  restoreResult: (resultId: string) => void;
  submitEvaluation: (submission: EvaluationSubmission) => string | null;
}

export interface InstructorEvaluationsProps {
  audience: EvaluationAudience;
}

export interface InstructorRatingFormProps {
  instructor: EvaluationInstructor;
  audience: EvaluationAudience;
  submission?: EvaluationSubmission;
  onSubmitted: () => void;
}

/** How many of a term's evaluation entries are in, across every faculty member. */
export interface EvaluationCompletion {
  facultyCount: number;
  studentResponses: number;
  studentEnrolled: number;
  /** Faculty members whose enrolled students have all responded. */
  studentsComplete: number;
  /** Faculty members with a complete Department Chair evaluation. */
  chairComplete: number;
  /** Faculty members with a College Dean evaluation. */
  deanComplete: number;
  /** Every faculty member has all three: students, Department Chair, and College Dean. */
  complete: boolean;
}
