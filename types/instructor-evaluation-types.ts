export interface InstructorEvaluationSubject {
  id: string;
  code: string;
  title: string;
  instructor: string;
  section: string;
  evaluationStatus: "pending" | "submitted";
  department: string | null;
}

export interface InstructorEvaluationData {
  subjects: readonly InstructorEvaluationSubject[];
  context: InstructorEvaluationContext;
  questionnaire: InstructorEvaluationQuestionnaire;
}

export interface InstructorEvaluationContext {
  programLevel: string;
  term: string;
}

export type EvaluationRating = 1 | 2 | 3 | 4 | 5;

export interface EvaluationRatingScale {
  value: EvaluationRating;
  label: string;
  frequency: string;
  definition: string;
}

export interface EvaluationQuestion {
  id: string;
  number: number;
  statement: string;
}

export interface EvaluationQuestionGroup {
  id: string;
  title: string;
  description: string;
  questions: readonly EvaluationQuestion[];
}

export interface InstructorEvaluationQuestionnaire {
  scales: readonly EvaluationRatingScale[];
  groups: readonly EvaluationQuestionGroup[];
}

export interface EvaluationDraft {
  ratings: Partial<Record<string, EvaluationRating>>;
  comments: string;
}

export interface InstructorEvaluationFormProps {
  subject: InstructorEvaluationSubject;
  context: InstructorEvaluationContext;
  questionnaire: InstructorEvaluationQuestionnaire;
  draft: EvaluationDraft;
  onChange: (draft: EvaluationDraft) => void;
  onSave: (draft: EvaluationDraft) => void;
  onSubmit: (draft: EvaluationDraft) => void;
  statusMessage: string;
  errorMessage: string;
}
