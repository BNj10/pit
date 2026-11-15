"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info, Send } from "lucide-react";
import { toast } from "sonner";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { evaluationTermKey } from "@/lib/faculty-evaluation";
import type { SupervisorEvaluationProps } from "@/types/faculty-evaluation-types";
import { LeaveEvaluationDialog } from "./leave-evaluation-dialog";

const ratingScale = [
  { value: 5, label: "Always", title: "Always manifested", description: "Behavior is evident in almost all relevant situations." },
  { value: 4, label: "Often", title: "Often manifested", description: "Evident most of the time, with occasional lapses or omissions." },
  { value: 3, label: "Sometimes", title: "Sometimes manifested", description: "Evident about half of the time in relevant situations." },
  { value: 2, label: "Seldom", title: "Seldom manifested", description: "Infrequently demonstrated in relevant situations." },
  { value: 1, label: "Never", title: "Never / Rarely manifested", description: "Almost never evident, with only isolated instances." },
] as const;

export function SupervisorEvaluation({ instructor, audience, title, listHref, listLabel }: SupervisorEvaluationProps) {
  const router = useRouter();
  const { data, window, status, submissions, submitEvaluation } = useEvaluation();
  const currentTerm = window ? evaluationTermKey(window) : null;
  const [term] = useState(currentTerm);
  const submission = submissions.find((item) =>
    item.term === term && item.instructorId === instructor.id && item.audience === audience,
  );
  const [ratings, setRatings] = useState<Record<string, number>>({ ...submission?.ratings });
  const [comments, setComments] = useState(submission?.comments ?? "");
  const [error, setError] = useState<string | null>(null);
  const sections = [...new Set(data.criteria.map((criterion) => criterion.section))];
  const ratedCount = data.criteria.filter((criterion) => ratings[criterion.id] !== undefined).length;
  const totalPoints = data.criteria.reduce((sum, criterion) => sum + (ratings[criterion.id] ?? 0), 0);
  const available = status === "Open" && term !== null && term === currentTerm;
  const readOnly = !!submission;
  const hasUnsavedChanges = !readOnly && (ratedCount > 0 || comments.trim() !== "");
  const instructions = readOnly
    ? "Your submitted evaluation is read-only. Ratings and recommendations are locked."
    : term !== currentTerm
      ? `The evaluation term has changed. Return to ${listLabel} to evaluate the current term.`
      : status === "Closed" || status === "Scheduled"
        ? "Evaluations are unavailable outside the open window. Your answers have been kept on this page."
        : "Review each benchmark and its suggested means of verification. Select one rating for every item using the five-point scale above.";

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
    if (!problem) {
      toast.success(`Evaluation submitted for ${instructor.name}.`);
      router.push(listHref);
    }
  }

  return (
    <main className="instructor-evaluation-form-content supervisor-evaluation-page" aria-labelledby="supervisor-evaluation-title">
      <header className="instructor-evaluation-form-heading">
        <div>
          <h2 id="supervisor-evaluation-title">{title}</h2>
          <p>Assess faculty performance using documented evidence and the prescribed five-point rating scale.</p>
        </div>
        {readOnly ? (
          <Button asChild variant="outline" className="supervisor-evaluation-back">
            <Link href={listHref}><ArrowLeft aria-hidden="true" />Back to {listLabel}</Link>
          </Button>
        ) : (
          <Badge variant="secondary" className="instructor-evaluation-progress" role="status" aria-live="polite" aria-atomic="true">
            {ratedCount} of {data.criteria.length} rated
          </Badge>
        )}
      </header>

      <form className="instructor-evaluation-card supervisor-evaluation-instrument" onSubmit={submit}>
        <div className="instructor-evaluation-form-header">
          <div>
            <p className="instructor-evaluation-annex">ANNEX B · SUPERVISOR’S EVALUATION OF FACULTY</p>
            <h3>Select one rating for every benchmark statement.</h3>
          </div>
          <ul className="instructor-evaluation-legend" aria-label="Five-point rating scale">
            {ratingScale.map((rating) => (
              <li key={rating.value}><span>{rating.value}</span>{rating.label}</li>
            ))}
          </ul>
        </div>

        <dl className="instructor-evaluation-faculty">
          <div><dt>FACULTY BEING EVALUATED</dt><dd>{instructor.name}</dd></div>
          <div><dt>ACADEMIC RANK</dt><dd>{instructor.rank}</dd></div>
          <div><dt>COLLEGE / DEPARTMENT</dt><dd>{instructor.department}</dd></div>
          <div><dt>SEMESTER / ACADEMIC YEAR</dt><dd>{window ? `${window.semester === "first" ? "1st" : "2nd"} Semester · AY ${window.academicYear}` : "No evaluation window"}</dd></div>
        </dl>

        <section className="instructor-evaluation-scale" aria-labelledby="supervisor-rating-guide-title">
          <div className="instructor-evaluation-scale-heading">
            <h3 id="supervisor-rating-guide-title">B. RATING SCALE · QUALITATIVE DESCRIPTION AND OPERATIONAL DEFINITION</h3>
            <p>Manifestation frequency</p>
          </div>
          <ul>
            {ratingScale.map((rating) => (
              <li key={rating.value}>
                <span>{rating.value}</span>
                <div><h4>{rating.title}</h4><p>{rating.description}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <p id="supervisor-evaluation-instructions" className="instructor-evaluation-instructions" data-unavailable={!available && status !== null}>
          <Info aria-hidden="true" />{instructions}
        </p>

        <div className="instructor-evaluation-rating-header supervisor-evaluation-rating-header" aria-hidden="true">
          <span>BENCHMARK STATEMENTS</span>
          <span>SUGGESTED MEANS FOR VERIFICATION</span>
          <div>{ratingScale.map((rating) => <span key={rating.value}>{rating.value}</span>)}</div>
        </div>
        {sections.map((section, index) => (
          <section key={section} aria-labelledby={`supervisor-evaluation-group-${index}`}>
            <header className="instructor-evaluation-group-heading">
              <h3 id={`supervisor-evaluation-group-${index}`}>{String.fromCharCode(65 + index)}. {section}</h3>
            </header>
            {data.criteria.filter((criterion) => criterion.section === section).map((criterion) => {
              const statement = criterion.supervisorStatement ?? criterion.statement;
              return (
                <div key={criterion.id} className="instructor-evaluation-question supervisor-evaluation-question">
                  <p id={`supervisor-evaluation-question-${criterion.id}`}><span>{criterion.id}.</span>{statement}</p>
                  <div id={`supervisor-evaluation-verification-${criterion.id}`} className="supervisor-evaluation-verification">
                    <span className="supervisor-verification-label">Suggested means for verification</span>
                    {criterion.verification ?? "—"}
                  </div>
                  <RadioGroup
                    name={`supervisor-rating-${criterion.id}`}
                    orientation="horizontal"
                    className="instructor-evaluation-ratings"
                    value={ratings[criterion.id]?.toString() ?? ""}
                    required
                    disabled={readOnly || !available}
                    aria-labelledby={`supervisor-evaluation-question-${criterion.id}`}
                    aria-describedby={`supervisor-evaluation-instructions supervisor-evaluation-verification-${criterion.id}${error ? " supervisor-evaluation-error" : ""}`}
                    onValueChange={(value) => {
                      const rating = ratingScale.find((item) => item.value.toString() === value);
                      if (!rating) return;
                      setError(null);
                      setRatings((current) => ({ ...current, [criterion.id]: rating.value }));
                    }}
                  >
                    {ratingScale.map((rating) => (
                      <Label
                        key={rating.value}
                        htmlFor={`supervisor-rating-${criterion.id}-${rating.value}`}
                        className="instructor-evaluation-rating-choice"
                      >
                        <RadioGroupItem
                          id={`supervisor-rating-${criterion.id}-${rating.value}`}
                          value={rating.value.toString()}
                          aria-label={`${rating.value}: ${rating.label}`}
                        />
                        <span>{rating.value}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}
          </section>
        ))}

        <div className="instructor-evaluation-comments">
          <div>
            <Label htmlFor="supervisor-evaluation-comments">Recommendations and Suggestions</Label>
            <span>Optional</span>
          </div>
          <p id="supervisor-evaluation-comments-help">Share constructive recommendations that can help the faculty member strengthen teaching performance and the learning experience.</p>
          <Textarea
            id="supervisor-evaluation-comments"
            aria-describedby="supervisor-evaluation-comments-help"
            placeholder="Write your recommendations or suggestions for the faculty member here…"
            value={comments}
            readOnly={readOnly}
            maxLength={3000}
            onChange={(event) => setComments(event.target.value)}
          />
        </div>

        <div className="instructor-evaluation-form-feedback">
          <p id="supervisor-evaluation-error" role="alert">{error}</p>
        </div>

        <footer className="instructor-evaluation-form-footer">
          <p>Overall Points: {totalPoints} / {data.criteria.length * 5}</p>
          <Button type="submit" className="w-[214px] max-w-full" disabled={readOnly || !available || ratedCount !== data.criteria.length}>
            <Send aria-hidden="true" />{readOnly ? "Evaluation submitted" : "Submit evaluation"}
          </Button>
        </footer>
      </form>
      {hasUnsavedChanges && (
        <LeaveEvaluationDialog onDiscard={() => {
          setRatings({});
          setComments("");
          setError(null);
        }} />
      )}
    </main>
  );
}
