import { evaluationTermId, evaluationTermKey } from "@/lib/faculty-evaluation";
import type {
  EvaluationClassResult,
  EvaluationCriterion,
  EvaluationSubmission,
  EvaluationSupervisorResult,
  EvaluationTermResult,
  EvaluationWindow,
  FacultyEvaluationData,
} from "@/types/faculty-evaluation-types";

export function classEvaluationAverage(result: EvaluationClassResult) {
  return result.responses > 0 ? result.totalScore / result.responses : null;
}

export function summarizeClassEvaluations(classes: readonly EvaluationClassResult[]) {
  const responses = classes.reduce((sum, result) => sum + result.responses, 0);
  const enrolled = classes.reduce((sum, result) => sum + result.enrolled, 0);
  const weightedScore = classes.reduce((sum, result) => sum + result.totalScore, 0);
  const rated = classes.filter((result) => result.responses > 0);
  const sorted = [...rated].sort((a, b) => a.totalScore / a.responses - b.totalScore / b.responses);

  return {
    responses,
    enrolled,
    weightedScore,
    studentScore: responses > 0 ? weightedScore / responses : null,
    highestClass: sorted.at(-1) ?? null,
    lowestClass: sorted[0] ?? null,
    completion: classes.length ? (rated.length / classes.length) * 100 : 0,
  };
}

export function supervisorEvaluationPoints(
  criteria: readonly EvaluationCriterion[],
  result: EvaluationSupervisorResult | null,
) {
  if (!result || !criteria.length || criteria.some(({ id }) =>
    !Number.isFinite(result.ratings[id]) || result.ratings[id] < 1 || result.ratings[id] > 5,
  )) return null;
  return criteria.reduce((sum, { id }) => sum + result.ratings[id], 0);
}

export function supervisorEvaluationScore(
  criteria: readonly EvaluationCriterion[],
  result: EvaluationSupervisorResult | null,
) {
  const points = supervisorEvaluationPoints(criteria, result);
  return points === null ? null : (points / (criteria.length * 5)) * 100;
}

function scored(values: readonly (number | null)[]) {
  return values.filter((value): value is number => value !== null);
}

function average(values: readonly number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

/**
 * Preview aggregate for a closed term. Student SET is weighted by responses;
 * Department Chair SEF and College Dean SEF are averaged across instructors
 * separately and never combined. The institution's official aggregation
 * policy has not been confirmed.
 */
export function summarizeEvaluationTerm(
  data: FacultyEvaluationData,
  term: Pick<EvaluationWindow, "academicYear" | "semester">,
  submissions: readonly EvaluationSubmission[],
): EvaluationTermResult {
  const key = evaluationTermKey(term);
  const instructors = data.instructors.map((instructor) => {
    const report = data.reports?.find((item) => item.instructorId === instructor.id && item.term === key);
    const students = summarizeClassEvaluations(report?.classes ?? []);
    const dean = submissions.find(
      (item) => item.term === key && item.instructorId === instructor.id && item.audience === "dean",
    );
    return {
      instructor,
      students,
      departmentChairScore: supervisorEvaluationScore(data.criteria, report?.departmentChair ?? null),
      deanScore: supervisorEvaluationScore(data.criteria, dean ? { ratings: dean.ratings, comments: [] } : null),
    };
  });
  const responseCount = instructors.reduce((sum, item) => sum + item.students.responses, 0);
  const weightedScore = instructors.reduce((sum, item) => sum + item.students.weightedScore, 0);

  return {
    id: evaluationTermId(term),
    academicYear: term.academicYear,
    semester: term.semester,
    facultyCount: data.instructors.length,
    responseCount,
    studentScore: responseCount > 0 ? weightedScore / responseCount : null,
    departmentChairScore: average(scored(instructors.map((item) => item.departmentChairScore))),
    deanScore: average(scored(instructors.map((item) => item.deanScore))),
    instructorResults: instructors.map(({ instructor, students, departmentChairScore, deanScore }) => ({
      instructor,
      responseCount: students.responses,
      studentScore: students.studentScore,
      departmentChairScore,
      deanScore,
    })),
  };
}
