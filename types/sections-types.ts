import type { Curriculum, DegreeProgram, Subject } from "./curriculum-types";

export type SectionClassType = "lecture" | "laboratory";
export type MeetingDay = "M" | "T" | "W" | "Th" | "F" | "Sa";
/** Year levels the sections page can select; curriculum subjects carry the same numbers. */
export type CurriculumYearLevel = 1 | 2 | 3 | 4;
/** Term of the academic year in which a subject is offered. */
export type OfferingTerm = "first" | "second" | "summer";

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

/** A subject of an active curriculum offered in one academic term for one year level. */
export interface SubjectOffering extends OfferingTermGroup {
  id: string;
  /** The curriculum subject offered; its curriculum is subject.curriculumId. */
  subjectId: string;
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
  /** The Department Chair's assigned degree program. */
  program: DegreeProgram;
  department: string;
  /** Faculty members of the department, who are the only ones the chair can assign. */
  faculty: readonly FacultyMember[];
  /** Terms Deans have created; chairs can only offer subjects in these. */
  academicTerms: readonly AcademicTerm[];
  initialAcademicYear: string;
  initialYearLevel: CurriculumYearLevel;
  /**
   * Active curricula, which the chair can offer subjects from, plus any other curriculum
   * an existing offering still references. Drafts never reach the sections page.
   */
  curricula: readonly Curriculum[];
  /** Subjects of those curricula. */
  subjects: readonly Subject[];
  termGroups: readonly OfferingTermGroup[];
  offerings: readonly SubjectOffering[];
  entries: readonly SectionEntry[];
  /** Year levels whose current offerings are already published for enrollment, per academic year. */
  publishedYearLevels: readonly { academicYear: string; yearLevel: CurriculumYearLevel }[];
}

/** Offering data loaded for the sections page before curricula are attached. */
export type SectionsSourceData = Omit<SectionsData, "program" | "curricula" | "subjects">;

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
  /** Weekly hours the subject's units require for this class type. */
  requiredHours: number;
  /** Hours still missing from this section block, or null when it is complete, over, or incomplete. */
  hoursShort: number | null;
  /** Short blocks can be saved; publishing waits until every block meets its units. */
  canSave: boolean;
}

/** A section block whose scheduled weekly hours are below what its units require. */
export interface ScheduleShortfall {
  offering: SubjectOffering;
  subject: Subject;
  section: string;
  classType: SectionClassType;
  scheduled: number;
  required: number;
}

/** A labelled group of subjects in the add subjects dialog. */
export interface OfferableSubjectGroup {
  id: string;
  label: string;
  subjects: readonly Subject[];
}

export interface SectionsManagerProps {
  data: SectionsData;
}

export interface SubjectSectionsProps {
  subject: Subject;
  curriculum: Pick<Curriculum, "name" | "status" | "year">;
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
  subject: Subject;
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
  term: OfferingTerm;
  yearLevel: CurriculumYearLevel;
  termLabel: string;
  yearLabel: string;
  /** Active curricula, latest implemented first; the first one is selected when the dialog opens. */
  curricula: readonly Curriculum[];
  subjects: readonly Subject[];
  /** Subjects this term already offers for the year level. */
  offeredSubjectIds: ReadonlySet<string>;
  onClose: () => void;
  onAdd: (subjectIds: readonly string[]) => void;
}

export interface CrossDepartmentAccessDialogProps {
  subject: Subject;
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
