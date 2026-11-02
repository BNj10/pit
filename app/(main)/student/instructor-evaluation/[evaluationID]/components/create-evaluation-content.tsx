"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { InstructorEvaluationForm } from "../../components/instructor-evaluation-form";
import { useInstructorEvaluation } from "../../components/instructor-evaluation-provider";

export function CreateEvaluationContent({ evaluationID }: { evaluationID: string }) {
  const router = useRouter();
  const {
    subjects, context, questionnaire, drafts, statusMessage, errorMessage,
    openEvaluation, changeDraft, saveDraft, submitPreview, clearFeedback,
  } = useInstructorEvaluation();
  const subject = subjects.find((item) => item.id === evaluationID);

  useEffect(() => { clearFeedback(); }, [clearFeedback]);
  useEffect(() => {
    if (subject) openEvaluation(subject);
  }, [subject, openEvaluation]);

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
        draft={drafts[subject.id] ?? { ratings: {}, comments: "" }}
        onChange={(draft) => changeDraft(subject, draft)}
        onSave={(draft) => saveDraft(subject, draft)}
        onSubmit={(draft) => {
          if (submitPreview(subject, draft)) router.push("/student/instructor-evaluation");
        }}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
      />
    </div>
  );
}
