"use client";

import Link from "next/link";
import { Check, ClipboardPen, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstructorEvaluation } from "./instructor-evaluation-provider";

export function InstructorEvaluationContent() {
  const { subjects: evaluations, statusMessage, errorMessage } = useInstructorEvaluation();

  return (
    <section className="instructor-evaluation-content" aria-labelledby="instructor-evaluation-title">
      <header className="instructor-evaluation-heading">
        <h2 id="instructor-evaluation-title">Instructor Evaluations</h2>
        <p id="instructor-evaluation-description">
          Select a subject to evaluate its assigned instructor. You may save an evaluation and continue later.
        </p>
      </header>
      <div className="instructor-evaluation-card">
        <Table
          className="instructor-evaluation-table"
          aria-labelledby="instructor-evaluation-title"
          aria-describedby="instructor-evaluation-description"
          containerProps={{
            role: "region",
            "aria-label": "Subjects and instructors; scroll horizontally to view all columns",
            tabIndex: 0,
            className: "table-scroll instructor-evaluation-table-scroll",
          }}
        >
          <colgroup>
            <col className="instructor-evaluation-instructor-column" />
            <col />
            <col className="instructor-evaluation-section-column" />
            <col className="instructor-evaluation-action-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">INSTRUCTOR</TableHead>
              <TableHead scope="col">SUBJECT</TableHead>
              <TableHead scope="col">SECTION</TableHead>
              <TableHead scope="col" className="instructor-evaluation-action-cell">EVALUATION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((subject) => (
              <TableRow key={subject.id}>
                <TableHead scope="row">{subject.instructor}</TableHead>
                <TableCell className="instructor-evaluation-subject-title">{subject.title}</TableCell>
                <TableCell>{subject.section}</TableCell>
                <TableCell className="instructor-evaluation-action-cell">
                  {subject.evaluationStatus === "submitted" ? (
                    <Badge variant="outline" className="instructor-evaluation-submitted" aria-label={`Evaluation submitted for ${subject.title}`}>
                      <Check aria-hidden="true" />
                      Submitted
                    </Badge>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="instructor-evaluation-action"
                    >
                      <Link
                        href={`/student/instructor-evaluation/${encodeURIComponent(subject.id)}`}
                        aria-label={`Evaluate ${subject.title} with ${subject.instructor}`}
                      >
                        <ClipboardPen aria-hidden="true" />
                        Evaluate
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {evaluations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="instructor-evaluation-empty" role="status">
                  No subjects are available for instructor evaluation.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <footer className="instructor-evaluation-footer">
          <ShieldCheck aria-hidden="true" />
          <p>Your evaluation is anonymous. Faculty can only view aggregated results after the evaluation period.</p>
        </footer>
      </div>
      {statusMessage && <p className="instructor-evaluation-feedback" role="status">{statusMessage}</p>}
      {errorMessage && <p className="instructor-evaluation-error" role="alert">{errorMessage}</p>}
    </section>
  );
}
