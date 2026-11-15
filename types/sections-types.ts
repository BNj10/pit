export type SectionClassType = "lecture" | "laboratory";
export type MeetingDay = "M" | "T" | "W" | "Th" | "F" | "Sa";
export type CurriculumYearLevel = 1 | 2 | 3 | 4;
/** Semester where the approved curriculum places a subject. */
export type CurriculumSemester = 1 | 2;
/** Term of the academic year in which a subject is offered. */
export type OfferingTerm = "first" | "second" | "summer";

export interface CurriculumSubject {
  code: string;
  title: string;
  /** Credit units; a subject's total units are lectureUnits + laboratoryUnits. */
  lectureUnits: number;
  laboratoryUnits: number;
  yearLevel: CurriculumYearLevel;
  semester: CurriculumSemester;
  /** Weekly contact hours the curriculum allows for each class type; 0 means not offered. */
  lectureHoursPerWeek: number;
  laboratoryHoursPerWeek: number;
}

/** A faculty member of the department, who can be assigned to teach section entries. */
export interface FacultyMember {
  id: string;
  name: string;
  department: string;
}

/** A school-wide academic term created by a Dean, e.g. A.Y. 2025–2026 · First Semester. */
export interface AcademicTerm {
  academicYear: string;
  term: OfferingTerm;
}

/** An academic term the chair has opened for one year level, e.g. Third Year · Summer. */
export interface OfferingTermGroup extends AcademicTerm {
  yearLevel: CurriculumYearLevel;
}

/**
 * When students from other departments may take the seats this department's students
 * have not filled. The chair's own department can always enroll once published.
 */
export type CrossDepartmentAccess =
  | { mode: "scheduled"; /** Asia/Manila local time, "YYYY-MM-DDTHH:MM". */ opensAt: string }
  | { mode: "open" }
  | { mode: "reserved" };

/** An approved subject offered in one academic term for one year level. */
export interface SubjectOffering extends OfferingTermGroup {
  id: string;
  subjectCode: string;
  crossDepartmentAccess: CrossDepartmentAccess;
}

/** One scheduled meeting pattern of an offered subject for a section block. */
export interface SectionEntry {
  id: string;
  offeringId: string;
  subjectCode: string;
  /** Section block shared by a cohort of students, e.g. "BSCS 3-A". */
  section: string;
  classType: SectionClassType;
  /** null while no faculty member is assigned yet. */
  facultyId: string | null;
  capacity: number;
  days: readonly MeetingDay[];
  /** 24-hour "HH:MM" local time. */
  startTime: string;
  endTime: string;
  room: string;
}

export interface SectionsData {
  program: string;
  department: string;
  /** Faculty members of the department, who are the only ones the chair can assign. */
  faculty: readonly FacultyMember[];
  /** Terms Deans have created; chairs can only offer subjects in these. */
  academicTerms: readonly AcademicTerm[];
  initialAcademicYear: string;
  initialYearLevel: CurriculumYearLevel;
  subjects: readonly CurriculumSubject[];
  termGroups: readonly OfferingTermGroup[];
  offerings: readonly SubjectOffering[];
  entries: readonly SectionEntry[];
  /** Year levels whose current offerings are already published for enrollment, per academic year. */
  publishedYearLevels: readonly { academicYear: string; yearLevel: CurriculumYearLevel }[];
}

/** The editable offering state, kept per browser session in the preview. */
export interface SectionsWorkspace {
  termGroups: readonly OfferingTermGroup[];
  offerings: readonly SubjectOffering[];
  entries: readonly SectionEntry[];
}

/**
 * published: students see exactly what is on screen.
 * draft: changes are saved but not visible to students.
 * unsaved: changes exist only in this editor.
 */
export type YearPublicationStatus = "published" | "draft" | "unsaved";

/** Form values as typed; validated before they become a SectionEntry. */
export interface SectionEntryDraft {
  section: string;
  capacity: string;
  classType: SectionClassType;
  /** Empty string while unassigned. */
  facultyId: string;
  days: readonly MeetingDay[];
  startTime: string;
  endTime: string;
  room: string;
}

export interface SectionEntryConflict {
  kind: "room" | "section" | "faculty";
  entry: SectionEntry;
}

export interface SectionEntryValidation {
  /** Problems that must be fixed before the schedule can be checked or saved. */
  missing: readonly string[];
  conflicts: readonly SectionEntryConflict[];
  /** Hours this entry meets each week, or null while its schedule is incomplete. */
  entryHours: number | null;
  /** Combined weekly hours of this section block's entries of the same class type. */
  totalHours: number | null;
  hourLimit: number;
  canSave: boolean;
}

export interface SectionsManagerProps {
  data: SectionsData;
}

export interface SubjectSectionsProps {
  subject: CurriculumSubject;
  faculty: readonly FacultyMember[];
  offering: SubjectOffering;
  /** Current time once known on the client; null during server rendering. */
  now: number | null;
  onEditAccess: () => void;
  entries: readonly SectionEntry[];
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (entry: SectionEntry) => void;
  onDelete: (entry: SectionEntry) => void;
  onRemove: () => void;
}

export interface SectionEntryDialogProps {
  subject: CurriculumSubject;
  offering: SubjectOffering;
  /** Undefined when adding a new entry. */
  entry?: SectionEntry;
  /** Entries in the same term, which share rooms, section blocks, and faculty with this one. */
  entries: readonly SectionEntry[];
  faculty: readonly FacultyMember[];
  onClose: () => void;
  onSave: (entry: SectionEntry) => void;
}

export interface AddOfferedSubjectsDialogProps {
  termLabel: string;
  yearLabel: string;
  /** Approved subjects for the year level that this term does not offer yet. */
  subjects: readonly CurriculumSubject[];
  onClose: () => void;
  onAdd: (subjectCodes: readonly string[]) => void;
}

export interface CrossDepartmentAccessDialogProps {
  subject: CurriculumSubject;
  offering: SubjectOffering;
  department: string;
  onClose: () => void;
  onSave: (access: CrossDepartmentAccess) => void;
}

export interface ConfirmDialogProps {
  title: string;
  description: string;
  /** Extra notes shown as a list, such as warnings to review before confirming. */
  details?: readonly string[];
  confirmLabel: string;
  tone: "destructive" | "primary";
  onClose: () => void;
  onConfirm: () => void;
}

export interface YearPublicationBarProps {
  yearLabel: string;
  status: YearPublicationStatus;
  everPublished: boolean;
  /** Reasons publishing is not allowed yet; empty when the year can be published. */
  blockers: readonly string[];
  onSaveDraft: () => void;
  onPublish: () => void;
}
