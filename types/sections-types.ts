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
  units: number;
  yearLevel: CurriculumYearLevel;
  semester: CurriculumSemester;
  /** Weekly contact hours the curriculum allows for each class type; 0 means not offered. */
  lectureHoursPerWeek: number;
  laboratoryHoursPerWeek: number;
}

/** A term the chair has opened for one year level, e.g. Third Year · Summer. */
export interface OfferingTermGroup {
  yearLevel: CurriculumYearLevel;
  term: OfferingTerm;
}

/** An approved subject offered in one term for one year level. */
export interface SubjectOffering extends OfferingTermGroup {
  id: string;
  subjectCode: string;
}

/** One scheduled meeting pattern of an offered subject for a section block. */
export interface SectionEntry {
  id: string;
  offeringId: string;
  subjectCode: string;
  /** Section block shared by a cohort of students, e.g. "BSCS 3-A". */
  section: string;
  classType: SectionClassType;
  capacity: number;
  days: readonly MeetingDay[];
  /** 24-hour "HH:MM" local time. */
  startTime: string;
  endTime: string;
  room: string;
}

export interface SectionsData {
  program: string;
  initialYearLevel: CurriculumYearLevel;
  subjects: readonly CurriculumSubject[];
  termGroups: readonly OfferingTermGroup[];
  offerings: readonly SubjectOffering[];
  entries: readonly SectionEntry[];
}

/** Form values as typed; validated before they become a SectionEntry. */
export interface SectionEntryDraft {
  section: string;
  capacity: string;
  classType: SectionClassType;
  days: readonly MeetingDay[];
  startTime: string;
  endTime: string;
  room: string;
}

export interface SectionEntryConflict {
  kind: "room" | "section";
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
  offering: SubjectOffering;
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
  /** Entries in the same term, which share rooms and section blocks with this one. */
  entries: readonly SectionEntry[];
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

export interface ConfirmRemovalDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}
