"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { evaluationTermKey } from "@/lib/faculty-evaluation";
import type { InstructorRatingFormProps } from "@/types/faculty-evaluation-types";
import { useEvaluation } from "./evaluation-provider";

export function InstructorRatingForm({
  instructor,
  audience,
  submission,
  onSubmitted,
}: InstructorRatingFormProps) {
  const { data, window, status, submitEvaluation } = useEvaluation();
  const currentTerm = window ? evaluationTermKey(window) : null;
  const [term] = useState(currentTerm);
  const [ratings, setRatings] = useState<Record<string, number>>({ ...submission?.ratings });
  const [comments, setComments] = useState(submission?.comments ?? "");
  const [error, setError] = useState<string | null>(null);
  const sections = [...new Set(data.criteria.map((criterion) => criterion.section))];
  const readOnly = !!submission;
  const available = status === "Open" && term !== null && term === currentTerm;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term) return;
    const problem = submitEvaluation({
      term,
      instructorId: instructor.id,
      audience,
      ratings,
      comments: comments.trim(),
    });
    setError(problem);
    if (!problem) onSubmitted();
  }

  return (
    <form className="faculty-evaluation-rating-form" onSubmit={submit}>
      <p className="faculty-evaluation-help">
        {readOnly
          ? "Your submitted evaluation is shown below."
          : "Select one rating for every benchmark statement."}
      </p>
      <p className="faculty-evaluation-scale">
        5 Always · 4 Often · 3 Sometimes · 2 Seldom · 1 Never
      </p>
      {sections.map((section, index) => (
        <section
          key={section}
          className="faculty-evaluation-rating-section"
          aria-labelledby={`rating-section-${index}`}
        >
          <h3 id={`rating-section-${index}`}>
            {String.fromCharCode(65 + index)}. {section}
          </h3>
          {data.criteria
            .filter((criterion) => criterion.section === section)
            .map((criterion) => (
              <fieldset
                key={criterion.id}
                disabled={readOnly}
                className="faculty-evaluation-rating-item"
              >
                <legend>
                  {criterion.id}.{" "}
                  {audience === "dean"
                    ? (criterion.supervisorStatement ?? criterion.statement)
                    : criterion.statement}
                </legend>
                <div className="faculty-evaluation-rating-options">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating}>
                      <input
                        type="radio"
                        name={`rating-${criterion.id}`}
                        value={rating}
                        required
                        checked={ratings[criterion.id] === rating}
                        onChange={() =>
                          setRatings((current) => ({ ...current, [criterion.id]: rating }))
                        }
                        aria-label={`${rating} — ${["Never", "Seldom", "Sometimes", "Often", "Always"][rating - 1]}`}
                      />
                      <span>{rating}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
        </section>
      ))}
      <div className="faculty-evaluation-field">
        <Label htmlFor="evaluation-comments">
          Recommendations and suggestions{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="evaluation-comments"
          value={comments}
          maxLength={3000}
          readOnly={readOnly}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Share constructive feedback for the instructor."
          className="min-h-24"
        />
      </div>
      {error && (
        <p className="faculty-evaluation-error" role="alert">
          {error}
        </p>
      )}
      {!readOnly && !available && (
        <p className="faculty-evaluation-error" role="status">
          The evaluation window is closed or has changed. Your answers are kept until you close this
          form.
        </p>
      )}
      <div className="faculty-evaluation-form-footer">
        <p className="faculty-evaluation-help">
          Overall points: {Object.values(ratings).reduce((sum, rating) => sum + rating, 0)} /{" "}
          {data.criteria.length * 5}
        </p>
        {!readOnly && (
          <Button type="submit" disabled={!available}>
            Submit evaluation
          </Button>
        )}
      </div>
    </form>
  );
}
