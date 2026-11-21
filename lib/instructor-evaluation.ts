import type { EvaluationDraft, InstructorEvaluationQuestionnaire } from "@/types/instructor-evaluation-types";

type EvaluationValidationResult =
  | { success: true; data: EvaluationDraft }
  | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function validateEvaluationDraft(
  questionnaire: InstructorEvaluationQuestionnaire,
  value: unknown,
): EvaluationValidationResult {
  if (!isRecord(value) || !isRecord(value.ratings) || typeof value.comments !== "string") {
    return { success: false, message: "Invalid evaluation draft." };
  }
  if (Object.keys(value).some((key) => key !== "ratings" && key !== "comments")) {
    return { success: false, message: "Unexpected evaluation field." };
  }
  if (value.comments.length > 5000) {
    return { success: false, message: "Keep your comments within 5,000 characters." };
  }

  const questionIds = new Set(questionnaire.groups.flatMap((group) => group.questions.map((question) => question.id)));
  const ratings: EvaluationDraft["ratings"] = {};
  for (const [id, rating] of Object.entries(value.ratings)) {
    if (!questionIds.has(id)) {
      return { success: false, message: "Unknown evaluation question." };
    }
    if (rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4 && rating !== 5) {
      return { success: false, message: "Choose a rating from 1 to 5." };
    }
    ratings[id] = rating;
  }
  return { success: true, data: { ratings, comments: value.comments } };
}

export function validateEvaluationSubmission(
  questionnaire: InstructorEvaluationQuestionnaire,
  value: unknown,
): EvaluationValidationResult {
  const result = validateEvaluationDraft(questionnaire, value);
  if (!result.success) return result;
  for (const group of questionnaire.groups) {
    for (const question of group.questions) {
      if (result.data.ratings[question.id] === undefined) {
        return { success: false, message: `Rate statement ${question.number}.` };
      }
    }
  }
  return result;
}

export function getEvaluationProgress(questionnaire: InstructorEvaluationQuestionnaire, draft: EvaluationDraft) {
  const questions = questionnaire.groups.flatMap((group) => group.questions);
  const ratings = questions.map((question) => draft.ratings[question.id]);
  return {
    answered: ratings.filter((rating) => rating !== undefined).length,
    total: questions.length,
    points: ratings.reduce<number>((total, rating) => total + (rating ?? 0), 0),
    maximumPoints: questions.length * 5,
  };
}
