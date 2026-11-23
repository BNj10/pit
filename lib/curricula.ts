import { normalizeSubjectCode } from "@/lib/curriculum-subjects";
import type {
  Curriculum,
  CurriculumDetails,
  CurriculumFormErrors,
  CurriculumFormValues,
  CurriculumStatus,
  CurriculumTransition,
  DegreeProgram,
  Subject,
} from "@/types/curriculum-types";

export const curriculumYearRange = { min: 2000, max: 2100 } as const;
export const curriculumNameMaxLength = 120;
export const curriculumDescriptionMaxLength = 500;

/** Status changes that apply without a confirmation dialog. */
export const curriculumTransitions = {
  activate: { from: "Draft", to: "Active" },
  deactivate: { from: "Active", to: "Draft" },
  restore: { from: "Archived", to: "Draft" },
} as const satisfies Record<CurriculumTransition, { from: CurriculumStatus; to: CurriculumStatus }>;

export function curriculumCode(program: Pick<DegreeProgram, "code">, year: number) {
  return `${program.code}-${year}`;
}

/** Only drafts are editable; active curricula are in use and archived ones are read-only. */
export const canEditCurriculum = (curriculum: Curriculum) => curriculum.status === "Draft";
export const canArchiveCurriculum = (curriculum: Curriculum) => curriculum.status === "Draft";
export const canDeleteCurriculum = (curriculum: Curriculum) => curriculum.status !== "Active";

/**
 * Subject codes of one curriculum that another active curriculum of the program already uses.
 * Codes are unique across active curricula, so a revised curriculum must give its subjects new
 * codes before it can be activated. The future server boundary must repeat this check atomically.
 */
export function activeSubjectCodeConflicts(
  curriculumId: string,
  curricula: readonly Curriculum[],
  subjects: readonly Subject[],
): { code: string; curriculum: Curriculum }[] {
  const activeById = new Map(curricula
    .filter((curriculum) => curriculum.status === "Active" && curriculum.id !== curriculumId)
    .map((curriculum) => [curriculum.id, curriculum]));
  const usedBy = new Map<string, Curriculum>();
  for (const subject of subjects) {
    const curriculum = activeById.get(subject.curriculumId);
    if (curriculum) usedBy.set(normalizeSubjectCode(subject.code), curriculum);
  }
  return subjects.flatMap((subject) => {
    const curriculum = subject.curriculumId === curriculumId ? usedBy.get(normalizeSubjectCode(subject.code)) : undefined;
    return curriculum ? [{ code: subject.code, curriculum }] : [];
  });
}

export function curriculumFormValues(curriculum?: Curriculum): CurriculumFormValues {
  return {
    name: curriculum?.name ?? "",
    year: curriculum ? String(curriculum.year) : "",
    implementedYear: curriculum ? String(curriculum.implementedYear) : "",
    description: curriculum?.description ?? "",
  };
}

function parseYear(value: string) {
  const text = value.trim();
  if (!/^\d{4}$/.test(text)) return null;
  const year = Number(text);
  return year >= curriculumYearRange.min && year <= curriculumYearRange.max ? year : null;
}

const yearRangeLabel = `${curriculumYearRange.min} and ${curriculumYearRange.max}`;

/**
 * Validates curriculum details against the program's other curricula.
 * The future server boundary must repeat these checks authoritatively;
 * uniqueness also needs database constraints.
 */
export function validateCurriculumDetails(
  values: CurriculumFormValues,
  curricula: readonly Curriculum[],
  editingId?: string,
): { errors: CurriculumFormErrors; details: CurriculumDetails | null } {
  const errors: CurriculumFormErrors = {};
  const others = curricula.filter((curriculum) => curriculum.id !== editingId);
  const name = values.name.trim();
  const description = values.description.trim();
  const year = parseYear(values.year);
  const implementedYear = parseYear(values.implementedYear);

  if (!name) {
    errors.name = "Enter a curriculum name.";
  } else if (name.length > curriculumNameMaxLength) {
    errors.name = `Use ${curriculumNameMaxLength} characters or fewer.`;
  } else if (others.some((curriculum) => curriculum.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    errors.name = "Another curriculum in this program already uses this name.";
  }

  if (!values.year.trim()) {
    errors.year = "Enter the curriculum year.";
  } else if (year === null) {
    errors.year = `Enter a four-digit year between ${yearRangeLabel}.`;
  } else if (others.some((curriculum) => curriculum.year === year)) {
    errors.year = `A ${year} curriculum already exists for this program.`;
  }

  if (!values.implementedYear.trim()) {
    errors.implementedYear = "Enter the year implemented.";
  } else if (implementedYear === null) {
    errors.implementedYear = `Enter a four-digit year between ${yearRangeLabel}.`;
  } else if (year !== null && implementedYear < year) {
    errors.implementedYear = "Use the curriculum year or a later year.";
  }

  if (description.length > curriculumDescriptionMaxLength) {
    errors.description = `Use ${curriculumDescriptionMaxLength} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0 || year === null || implementedYear === null) {
    return { errors, details: null };
  }
  return { errors, details: { name, year, implementedYear, description: description || null } };
}

export function subjectCountLabel(count: number) {
  return `${count} ${count === 1 ? "subject" : "subjects"}`;
}
