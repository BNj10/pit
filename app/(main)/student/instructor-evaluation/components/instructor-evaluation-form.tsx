"use client";

import { useState, type FormEvent } from "react";
import { Info, Save, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { getEvaluationProgress, validateEvaluationSubmission } from "@/lib/instructor-evaluation";
import type { InstructorEvaluationFormProps } from "@/types/instructor-evaluation-exports";

export function InstructorEvaluationForm({
  subject, context, questionnaire, draft, onChange, onSave, onSubmit,
  statusMessage, errorMessage,
}: InstructorEvaluationFormProps) {
  const [validationMessage, setValidationMessage] = useState("");
  const [showMissingRatings, setShowMissingRatings] = useState(false);
  const progress = getEvaluationProgress(questionnaire, draft);
  const questions = questionnaire.groups.flatMap((group) => group.questions);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateEvaluationSubmission(questionnaire, draft);
    if (!result.success) {
      const missing = questions.find((question) => draft.ratings[question.id] === undefined);
      setShowMissingRatings(true);
      setValidationMessage(missing
        ? `Please rate all ${progress.total} statements before submitting.`
        : result.message);
      document.getElementById(missing ? `evaluation-${missing.id}-${questionnaire.scales[0].value}` : "evaluation-comments")?.focus();
      return;
    }
    setValidationMessage("");
    onSubmit(result.data);
  }

  return (
    <section className="instructor-evaluation-form-content" aria-labelledby="evaluation-form-title">
      <header className="instructor-evaluation-form-heading">
        <div>
          <h2 id="evaluation-form-title">Student Evaluation of Teaching</h2>
          <p>Rate your instructor for the selected subject. Responses are confidential and reviewed after grades are finalized.</p>
        </div>
        <Badge variant="secondary" className="instructor-evaluation-progress" aria-live="polite">
          {progress.answered} of {progress.total} answered
        </Badge>
      </header>
      <p className="instructor-evaluation-preview-note">Preview only. Submit completes this demonstration; no responses are sent to the university. Saved drafts stay in this browser tab until it closes.</p>
      <form className="instructor-evaluation-card instructor-evaluation-form" onSubmit={handleSubmit} noValidate>
        <div className="instructor-evaluation-form-header">
          <div>
            <p className="instructor-evaluation-annex">ANNEX A · STUDENT EVALUATION OF TEACHERS</p>
            <h3>Select one rating for every benchmark statement.</h3>
          </div>
          <ul className="instructor-evaluation-legend" aria-label="Rating scale">
            {questionnaire.scales.map((scale) => (
              <li key={scale.value}><span>{scale.value}</span>{scale.label}</li>
            ))}
          </ul>
        </div>
        <dl className="instructor-evaluation-faculty">
          <div><dt>FACULTY BEING EVALUATED</dt><dd>{subject.instructor}</dd></div>
          <div><dt>COLLEGE / DEPARTMENT</dt><dd>{subject.department ?? "Not yet available"}</dd></div>
          <div><dt>COURSE CODE / TITLE</dt><dd>{subject.code} · {subject.title}</dd></div>
          <div><dt>PROGRAM LEVEL</dt><dd>{context.programLevel}</dd></div>
          <div><dt>SEMESTER / ACADEMIC YEAR</dt><dd>{context.term}</dd></div>
        </dl>
        <section className="instructor-evaluation-scale" aria-labelledby="evaluation-scale-title">
          <div className="instructor-evaluation-scale-heading">
            <h3 id="evaluation-scale-title">B. RATING SCALE · QUALITATIVE DESCRIPTION AND OPERATIONAL DEFINITION</h3>
            <p>Manifestation frequency</p>
          </div>
          <ul>
            {questionnaire.scales.map((scale) => (
              <li key={scale.value}>
                <span>{scale.value}</span>
                <div><h4>{scale.frequency}</h4><p>{scale.definition}</p></div>
              </li>
            ))}
          </ul>
        </section>
        <p id="evaluation-rating-instructions" className="instructor-evaluation-instructions">
          <Info aria-hidden="true" /> Read each benchmark statement carefully. Select one rating for every item using the five-point scale above.
        </p>
        <div className="instructor-evaluation-rating-header" aria-hidden="true">
          <span>BENCHMARK STATEMENTS FOR FACULTY TEACHING EFFECTIVENESS</span>
          <div>{questionnaire.scales.map((scale) => <span key={scale.value}>{scale.value}</span>)}</div>
        </div>
        {questionnaire.groups.map((group) => (
          <section key={group.id} aria-labelledby={`evaluation-group-${group.id}`}>
            <header className="instructor-evaluation-group-heading">
              <h3 id={`evaluation-group-${group.id}`}>{group.title}</h3>
              <p>{group.description}</p>
            </header>
            {group.questions.map((question) => {
              const missing = showMissingRatings && draft.ratings[question.id] === undefined;
              return (
                <div key={question.id} className="instructor-evaluation-question" data-invalid={missing || undefined}>
                  <p id={`evaluation-question-${question.id}`}><span>{question.number}.</span>{question.statement}</p>
                  <RadioGroup
                    name={question.id}
                    orientation="horizontal"
                    className="instructor-evaluation-ratings"
                    value={draft.ratings[question.id]?.toString() ?? ""}
                    aria-labelledby={`evaluation-question-${question.id}`}
                    aria-describedby={missing ? "evaluation-rating-instructions evaluation-validation-error" : "evaluation-rating-instructions"}
                    aria-invalid={missing}
                    aria-required="true"
                    onValueChange={(value) => {
                      const scale = questionnaire.scales.find((item) => item.value.toString() === value);
                      if (scale) {
                        const nextDraft = { ...draft, ratings: { ...draft.ratings, [question.id]: scale.value } };
                        onChange(nextDraft);
                        if (getEvaluationProgress(questionnaire, nextDraft).answered === progress.total) setValidationMessage("");
                      }
                    }}
                  >
                    {questionnaire.scales.map((scale) => (
                      <Label key={scale.value} htmlFor={`evaluation-${question.id}-${scale.value}`} className="instructor-evaluation-rating-choice">
                        <RadioGroupItem id={`evaluation-${question.id}-${scale.value}`} value={scale.value.toString()} aria-label={`${scale.value}: ${scale.label}`} />
                        <span>{scale.value}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}
          </section>
        ))}
        <div className="instructor-evaluation-comments">
          <div><Label htmlFor="evaluation-comments">Recommendations and Suggestions</Label><span>OPTIONAL</span></div>
          <p id="evaluation-comments-guidance">Share constructive feedback that can help your instructor improve the learning experience. Please be specific and respectful. Maximum 5,000 characters.</p>
          <Textarea
            id="evaluation-comments"
            aria-describedby="evaluation-comments-guidance"
            value={draft.comments}
            maxLength={5000}
            placeholder="Write your recommendations or suggestions for your instructor here…"
            onChange={(event) => {
              onChange({ ...draft, comments: event.target.value });
              if (progress.answered === progress.total) setValidationMessage("");
            }}
          />
        </div>
        <div className="instructor-evaluation-form-feedback">
          <p id="evaluation-validation-error" role="alert">{validationMessage}</p>
          {errorMessage && <p role="alert">{errorMessage}</p>}
          {statusMessage && <p role="status">{statusMessage}</p>}
        </div>
        <footer className="instructor-evaluation-form-footer">
          <p>Overall Points: {progress.points} / {progress.maximumPoints}</p>
          <div>
            <Button type="button" variant="outline" onClick={() => { setValidationMessage(""); onSave(draft); }}><Save aria-hidden="true" /> Save draft</Button>
            <Button type="submit"><Send aria-hidden="true" /> Submit evaluation</Button>
          </div>
        </footer>
      </form>
    </section>
  );
}
