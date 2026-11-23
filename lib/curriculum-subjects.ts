import type {
  CurriculumTerm,
  Semester,
  Subject,
  SubjectDependent,
  SubjectDetails,
  SubjectFormErrors,
  SubjectFormValues,
} from "@/types/curriculum-types";

export const semesters = [
  { value: "first", label: "1st semester" },
  { value: "second", label: "2nd semester" },
  { value: "summer", label: "Summer" },
] as const satisfies readonly { value: Semester; label: string }[];

export const subjectCodeMaxLength = 20;
export const subjectTitleMaxLength = 150;
const componentUnitMax = 9;

export function isSemester(value: unknown): value is Semester {
  return semesters.some((semester) => semester.value === value);
}

export function semesterLabel(semester: Semester) {
  return semesters.find((item) => item.value === semester)?.label ?? semester;
}

export function yearLevelLabel(yearLevel: number) {
  const suffix = yearLevel % 100 >= 11 && yearLevel % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[yearLevel % 10] ?? "th";
  return `${yearLevel}${suffix} year`;
}

export function termLabel(term: CurriculumTerm) {
  return `${yearLevelLabel(term.yearLevel)} · ${semesterLabel(term.semester)}`;
}

/** Position of a term in a curriculum; Summer follows the 2nd semester. */
export function termOrder(term: CurriculumTerm) {
  return (term.yearLevel - 1) * semesters.length + semesters.findIndex((item) => item.value === term.semester);
}

export const isSameTerm = (a: CurriculumTerm, b: CurriculumTerm) => termOrder(a) === termOrder(b);

export function normalizeSubjectCode(code: string) {
  return code.trim().replace(/\s+/g, " ").toUpperCase();
}

export function summarizeSubjects(subjects: readonly Subject[]) {
  return {
    count: subjects.length,
    units: subjects.reduce((total, subject) => total + subject.units, 0),
  };
}

export function sortSubjects(subjects: readonly Subject[]) {
  return [...subjects].sort((a, b) => termOrder(a) - termOrder(b) || a.code.localeCompare(b.code, undefined, { numeric: true }));
}

/** Subjects that may be prerequisites for a subject in `term`: those in earlier terms. */
export function prerequisiteOptions(subjects: readonly Subject[], term: CurriculumTerm, selfId?: string) {
  return sortSubjects(subjects.filter((subject) => subject.id !== selfId && termOrder(subject) < termOrder(term)));
}

/** Subjects that may be corequisites for a subject in `term`: others in the same term. */
export function corequisiteOptions(subjects: readonly Subject[], term: CurriculumTerm, selfId?: string) {
  return sortSubjects(subjects.filter((subject) => subject.id !== selfId && isSameTerm(subject, term)));
}

/** Other subjects whose requisites include `subjectId`. */
export function subjectDependents(
  subjectId: string,
  subjects: readonly Subject[],
): SubjectDependent[] {
  return subjects.flatMap<SubjectDependent>((subject) =>
    subject.prerequisiteIds.includes(subjectId)
      ? [{ subject, relation: "prerequisite" }]
      : subject.corequisiteIds.includes(subjectId)
        ? [{ subject, relation: "corequisite" }]
        : [],
  );
}

export function subjectFormValues(subject: Subject | undefined, term: CurriculumTerm): SubjectFormValues {
  return {
    code: subject?.code ?? "",
    title: subject?.title ?? "",
    yearLevel: subject?.yearLevel ?? term.yearLevel,
    semester: subject?.semester ?? term.semester,
    lectureUnits: subject ? String(subject.lectureUnits) : "",
    laboratoryUnits: subject ? String(subject.laboratoryUnits) : "",
    prerequisiteIds: subject?.prerequisiteIds ?? [],
    corequisiteIds: subject?.corequisiteIds ?? [],
  };
}

function parseWholeNumber(value: string, max: number) {
  const text = value.trim();
  if (!/^\d{1,2}$/.test(text)) return null;
  const number = Number(text);
  return number <= max ? number : null;
}

function codes(subjects: readonly Subject[]) {
  return subjects.map((subject) => subject.code).join(", ");
}

/**
 * Validates a subject against the other subjects of its curriculum.
 * The future server boundary must repeat these checks authoritatively.
 */
export function validateSubject(
  values: SubjectFormValues,
  curriculumSubjects: readonly Subject[],
  yearLevels: number,
  editingId?: string,
): { errors: SubjectFormErrors; details: SubjectDetails | null } {
  const errors: SubjectFormErrors = {};
  const others = curriculumSubjects.filter((subject) => subject.id !== editingId);
  const byId = new Map(others.map((subject) => [subject.id, subject]));
  const code = normalizeSubjectCode(values.code);
  const title = values.title.trim();
  const term: CurriculumTerm = { yearLevel: values.yearLevel, semester: values.semester };
  const validTerm =
    Number.isInteger(term.yearLevel) && term.yearLevel >= 1 && term.yearLevel <= yearLevels && isSemester(term.semester);
  const lectureUnits = parseWholeNumber(values.lectureUnits, componentUnitMax);
  const laboratoryUnits = parseWholeNumber(values.laboratoryUnits, componentUnitMax);

  if (!code) {
    errors.code = "Enter a subject code.";
  } else if (code.length > subjectCodeMaxLength) {
    errors.code = `Use ${subjectCodeMaxLength} characters or fewer.`;
  } else if (others.some((subject) => subject.code === code)) {
    errors.code = `${code} is already in this curriculum.`;
  }

  if (!title) {
    errors.title = "Enter a subject title.";
  } else if (title.length > subjectTitleMaxLength) {
    errors.title = `Use ${subjectTitleMaxLength} characters or fewer.`;
  }

  if (lectureUnits === null) errors.lectureUnits = `Enter a whole number from 0 to ${componentUnitMax}.`;
  if (laboratoryUnits === null) errors.laboratoryUnits = `Enter a whole number from 0 to ${componentUnitMax}.`;
  if (lectureUnits === 0 && laboratoryUnits === 0) {
    errors.lectureUnits = "Lecture and laboratory units cannot both be 0.";
  }

  if (!validTerm) {
    errors.term = "Choose a year level and semester.";
  } else {
    const label = termLabel(term);
    const prerequisites = values.prerequisiteIds.map((id) => byId.get(id));
    const misplacedPrerequisites = prerequisites.filter(
      (subject): subject is Subject => subject !== undefined && termOrder(subject) >= termOrder(term),
    );
    if (prerequisites.includes(undefined)) {
      errors.prerequisiteIds = "A selected prerequisite is no longer in this curriculum. Review the selection.";
    } else if (misplacedPrerequisites.length > 0) {
      errors.prerequisiteIds = `${codes(misplacedPrerequisites)} must be in a term before ${label}. Remove ${misplacedPrerequisites.length === 1 ? "it" : "them"} or choose a later term.`;
    }

    const corequisites = values.corequisiteIds.map((id) => byId.get(id));
    const misplacedCorequisites = corequisites.filter(
      (subject): subject is Subject => subject !== undefined && !isSameTerm(subject, term),
    );
    if (corequisites.includes(undefined)) {
      errors.corequisiteIds = "A selected corequisite is no longer in this curriculum. Review the selection.";
    } else if (misplacedCorequisites.length > 0) {
      errors.corequisiteIds = `${codes(misplacedCorequisites)} must be in ${label} to be taken together. Remove ${misplacedCorequisites.length === 1 ? "it" : "them"} or move ${misplacedCorequisites.length === 1 ? "it" : "them"} first.`;
    }

    // Subjects that list this one as a prerequisite must stay in later terms.
    const blockedDependents = editingId
      ? others.filter((subject) => subject.prerequisiteIds.includes(editingId) && termOrder(subject) <= termOrder(term))
      : [];
    if (blockedDependents.length > 0) {
      errors.term = blockedDependents
        .map((subject) => `${subject.code} (${termLabel(subject)}) lists this subject as a prerequisite.`)
        .join(" ") + ` Choose a term before ${termLabel(sortSubjects(blockedDependents)[0])}, or update ${blockedDependents.length === 1 ? "that subject" : "those subjects"} first.`;
    }
  }

  if (
    Object.keys(errors).length > 0 ||
    !validTerm ||
    lectureUnits === null ||
    laboratoryUnits === null
  ) {
    return { errors, details: null };
  }

  return {
    errors,
    details: {
      code,
      title,
      yearLevel: term.yearLevel,
      semester: term.semester,
      lectureUnits,
      laboratoryUnits,
      // Total units are lecture + laboratory units; each unit is one weekly contact hour.
      units: lectureUnits + laboratoryUnits,
      prerequisiteIds: [...values.prerequisiteIds],
      corequisiteIds: [...values.corequisiteIds],
    },
  };
}

/** Keeps corequisites mutual: other subjects list `subjectId` exactly when it lists them. */
export function syncCorequisites(subjects: readonly Subject[], subjectId: string, corequisiteIds: readonly string[]) {
  return subjects.map((subject) => {
    if (subject.id === subjectId) return subject;
    const listed = subject.corequisiteIds.includes(subjectId);
    const wanted = corequisiteIds.includes(subject.id);
    if (listed === wanted) return subject;
    return {
      ...subject,
      corequisiteIds: wanted
        ? [...subject.corequisiteIds, subjectId]
        : subject.corequisiteIds.filter((id) => id !== subjectId),
    };
  });
}
