import type {
  GradePeriod,
  StudentGrade,
  StudentGradeRecord,
  StudentGradesData,
  StudentGradesSemester,
} from "@/types/student-grades-types";

interface StudentGradeRecordsState {
  records: StudentGradesData["records"];
  savedRecords: StudentGradesData["records"];
  draftView: { semester: string; isEditing: boolean } | null;
}

type StudentGradeRecordsAction = {
  semester: StudentGradesSemester;
  canEditRecord: boolean;
} & (
  | { type: "create"; subjects: NonNullable<StudentGradesData["enrolledSubjects"]> }
  | { type: "change-grade"; code: string; period: GradePeriod; grade: StudentGrade }
  | { type: "edit" | "save-draft" | "publish" | "reload" }
);

export function canManageStudentGrades(semester: StudentGradesSemester, canEditRecord: boolean) {
  return canEditRecord && semester.schoolYearStatus === "current";
}

export function getGradePublication(record: StudentGradeRecord) {
  if (!record.published) return "draft";
  return record.published.subjects.length > 0 && record.published.subjects.every(
    (subject) => subject.midterm !== null && subject.final !== null,
  ) ? "published" : "partial";
}

/** A record is a draft until first published, then only while its draft grades differ from the published grades. */
export function hasUnpublishedGradeChanges(record: StudentGradeRecord) {
  if (!record.published) return true;
  const published = new Map(record.published.subjects.map((subject) => [subject.code, subject]));
  return record.draft.subjects.length !== record.published.subjects.length || record.draft.subjects.some((subject) => {
    const publishedSubject = published.get(subject.code);
    return !publishedSubject || publishedSubject.midterm !== subject.midterm || publishedSubject.final !== subject.final;
  });
}

export function createStudentGradeRecordsState(records: StudentGradesData["records"]): StudentGradeRecordsState {
  return { records, savedRecords: records, draftView: null };
}

export function studentGradeRecordsReducer(
  state: StudentGradeRecordsState,
  action: StudentGradeRecordsAction,
): StudentGradeRecordsState {
  const key = action.semester.value;
  const record = state.records[key];

  if (action.type === "reload") {
    return {
      ...state,
      records: { ...state.records, [key]: state.savedRecords[key] },
      draftView: null,
    };
  }

  // Guard every mutation, including callbacks from an editor opened before closure.
  if (!canManageStudentGrades(action.semester, action.canEditRecord)) return state;

  if (action.type === "create") {
    if (record) return state;
    return {
      ...state,
      records: {
        ...state.records,
        [key]: {
          draft: {
            subjects: action.subjects.map((subject) => ({ ...subject, midterm: null, final: null })),
          },
          published: null,
        },
      },
      draftView: { semester: key, isEditing: true },
    };
  }

  if (!record) return state;
  if (action.type === "edit") return { ...state, draftView: { semester: key, isEditing: true } };

  if (action.type === "publish") {
    if (record.published && state.draftView?.semester !== key) return state;
    if (!record.draft.subjects.some((subject) => subject.midterm !== null || subject.final !== null)) return state;
    const publishedRecord = { ...record, published: record.draft };
    return {
      ...state,
      records: { ...state.records, [key]: publishedRecord },
      savedRecords: { ...state.savedRecords, [key]: publishedRecord },
      draftView: null,
    };
  }

  if (state.draftView?.semester !== key || !state.draftView.isEditing) return state;

  if (action.type === "change-grade") {
    if (!record.draft.subjects.some((subject) => subject.code === action.code)) return state;
    return {
      ...state,
      records: {
        ...state.records,
        [key]: {
          ...record,
          draft: {
            ...record.draft,
            subjects: record.draft.subjects.map((subject) => subject.code === action.code
              ? { ...subject, [action.period]: action.grade }
              : subject),
          },
        },
      },
    };
  }

  if (action.type === "save-draft") {
    return {
      ...state,
      savedRecords: { ...state.savedRecords, [key]: record },
      draftView: { semester: key, isEditing: false },
    };
  }

  return state;
}
