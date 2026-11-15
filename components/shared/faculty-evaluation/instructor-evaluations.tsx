"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartColumn, FilePenLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { evaluationTermKey, evaluationTermLabel } from "@/lib/faculty-evaluation";
import type {
  InstructorEvaluationsProps,
  InstructorRatingFormProps,
  SupervisorEvaluationAudience,
} from "@/types/faculty-evaluation-types";
import { useEvaluation } from "./evaluation-provider";
import { InstructorRatingForm } from "./instructor-rating-form";

const supervisorEvaluationRoutes = {
  dean: {
    evaluate: "/dean/faculty-evaluation/instructors/evaluate-faculty",
    results: "/dean/faculty-evaluation/instructors/faculty-evaluation-results",
  },
  "department-chair": {
    evaluate: "/department-chair/instructor-evaluation/evaluate",
    results: "/department-chair/instructor-evaluation/results",
  },
} as const satisfies Record<SupervisorEvaluationAudience, { evaluate: string; results: string }>;

export function InstructorEvaluationAction({
  instructor,
  audience,
  submission,
}: Omit<InstructorRatingFormProps, "onSubmitted">) {
  const { window, status } = useEvaluation();
  const [open, setOpen] = useState(false);

  const routes = audience === "student" ? null : supervisorEvaluationRoutes[audience];

  if (routes && (submission || status === "Open")) {
    return (
      <Button asChild variant="outline" className={`instructor-evaluation-action${submission ? " instructor-evaluation-submitted" : ""}`}>
        <Link
          href={{
            pathname: submission ? routes.results : routes.evaluate,
            query: { instructor: instructor.id },
          }}
          aria-label={`${submission ? "View results for" : "Evaluate"} ${instructor.name}`}
        >
          {submission ? <ChartColumn aria-hidden="true" strokeWidth={1.5} /> : <FilePenLine aria-hidden="true" strokeWidth={1.5} />}
          {submission ? "View results" : "Evaluate"}
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`instructor-evaluation-action${submission ? " instructor-evaluation-submitted" : ""}`}
          disabled={!submission && status !== "Open"}
          aria-label={`${submission ? "View results for" : "Evaluate"} ${instructor.name}`}
          title={!submission && status !== "Open" ? "Evaluations are available during the open window." : undefined}
        >
          {submission ? (
            <ChartColumn aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <FilePenLine aria-hidden="true" strokeWidth={1.5} />
          )}
          {submission ? "View results" : "Evaluate"}
        </Button>
      </DialogTrigger>
      <DialogContent className="faculty-evaluation-dialog faculty-evaluation-rating-dialog">
        <DialogHeader>
          <DialogTitle>
            {audience !== "student"
              ? "Supervisor’s evaluation of faculty"
              : "Student evaluation of teaching"}
          </DialogTitle>
          <DialogDescription>
            {instructor.name}{window ? ` · ${evaluationTermLabel(window)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <InstructorRatingForm
          instructor={instructor}
          audience={audience}
          submission={submission}
          onSubmitted={() => {
            setOpen(false);
            toast.success(`Evaluation submitted for ${instructor.name}.`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function InstructorEvaluations({ audience }: InstructorEvaluationsProps) {
  const { data, window, status, submissions } = useEvaluation();
  const term = window ? evaluationTermKey(window) : null;

  return (
    <div className="faculty-evaluation-roster">
      {status !== "Open" && (
        <p className="faculty-evaluation-help" role="status">
          {status === "Scheduled"
            ? "Ratings will be available when the evaluation window opens."
            : status === null
              ? "Checking evaluation availability…"
              : !window
                ? "Ratings will be available once an evaluation window is created."
                : "Ratings are unavailable while the evaluation window is closed."}
        </p>
      )}
      <Table
        className="faculty-evaluation-instructor-table"
        containerProps={{
          tabIndex: 0,
          role: "region",
          "aria-label": "Instructors available for evaluation",
        }}
      >
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Instructor</TableHead>
            <TableHead scope="col">{audience !== "student" ? "Academic rank" : "Subject"}</TableHead>
            <TableHead scope="col">Evaluation</TableHead>
            <TableHead scope="col">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.instructors.map((instructor) => {
            const submission = submissions.find(
              (item) =>
                item.term === term &&
                item.instructorId === instructor.id &&
                item.audience === audience,
            );
            return (
              <TableRow key={instructor.id}>
                <TableCell>
                  <p className="font-medium">{instructor.name}</p>
                  <p className="faculty-evaluation-help">{instructor.department}</p>
                </TableCell>
                <TableCell>{audience !== "student" ? instructor.rank : instructor.subject}</TableCell>
                <TableCell>{submission ? "Submitted" : "Pending"}</TableCell>
                <TableCell>
                  <InstructorEvaluationAction
                    instructor={instructor}
                    audience={audience}
                    submission={submission}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {data.instructors.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                No instructors are assigned for evaluation this term.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="faculty-evaluation-help">
        Rate each assigned instructor once per term. Submitted evaluations cannot be edited.
      </p>
    </div>
  );
}
