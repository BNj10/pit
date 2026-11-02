"use client";

import { useRouter } from "next/navigation";

import { InstructorEvaluationForm } from "../../components/instructor-evaluation-form";
import { useInstructorEvaluation } from "../../components/instructor-evaluation-provider";

export function CreateEvaluationContent({ evaluationID }: { evaluationID: string }) {
  const router = useRouter();
  const {
    subjects, context, questionnaire, submitPreview,
  } = useInstructorEvaluation();
  const subject = subjects.find((item) => item.id === evaluationID);

  if (!subject) return null;

  if (subject.evaluationStatus === "submitted") {
    return (
      <section className="instructor-evaluation-content">
        <p role="status">The evaluation for {subject.title} has already been submitted.</p>
      </section>
    );
  }

  return (
    <div className="instructor-evaluation-content">
      <InstructorEvaluationForm
        subject={subject}
        context={context}
        questionnaire={questionnaire}
        onSubmit={(draft) => {
          const submitted = submitPreview(subject, draft);
          if (submitted) router.push("/student/instructor-evaluation");
          return submitted;
        }}
      />
    </div>
  );
}
