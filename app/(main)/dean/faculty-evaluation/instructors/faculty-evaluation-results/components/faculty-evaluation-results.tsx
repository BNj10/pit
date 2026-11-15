"use client";

import { useState } from "react";
import { Download, Printer, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evaluationTermKey, formatEvaluationScore } from "@/lib/faculty-evaluation";
import { createFacultyEvaluationPdf } from "@/lib/faculty-evaluation-pdf";
import { classEvaluationAverage, summarizeClassEvaluations, supervisorEvaluationPoints, supervisorEvaluationScore } from "@/lib/faculty-evaluation-results";
import type { EvaluationInstructor, EvaluationSupervisorResult, EvaluationTermResult, FacultyEvaluationDocument } from "@/types/faculty-evaluation-types";

const pageSize = 3;
const count = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export function FacultyEvaluationResults({ instructor, historicalTerm }: {
  instructor: EvaluationInstructor;
  historicalTerm?: EvaluationTermResult;
}) {
  const { data, window: evaluationWindow, submissions } = useEvaluation();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("student");
  const evaluationTerm = historicalTerm ?? evaluationWindow;
  if (!evaluationTerm) {
    return (
      <main className="faculty-results-page" aria-labelledby="faculty-results-title">
        <h2 id="faculty-results-title">Faculty evaluation results</h2>
        <p className="faculty-results-help">No evaluation window has been created yet, so there are no results to show.</p>
      </main>
    );
  }
  const term = evaluationTermKey(evaluationTerm);
  const archivedSummary = historicalTerm?.instructorResults?.find((item) => item.instructor.id === instructor.id);
  const report = data.reports?.find((item) => item.instructorId === instructor.id && item.term === term);
  const classes = report?.classes ?? [];
  const summary = summarizeClassEvaluations(classes);
  const studentScore = archivedSummary ? archivedSummary.studentScore : summary.studentScore;
  const responseCount = archivedSummary ? archivedSummary.responseCount : summary.responses;
  const classBreakdownUnavailable = Boolean(historicalTerm && !classes.length);
  const classTotals = classBreakdownUnavailable
    ? `${count(responseCount)} student responses · Class breakdown unavailable`
    : `${count(summary.responses)} / ${count(summary.enrolled)} responses · ${count(summary.weightedScore)} weighted score`;
  // Session submissions start from the fixtures, so they also cover closed terms.
  const submission = submissions.find((item) => item.instructorId === instructor.id && item.term === term && item.audience === "dean");
  const collegeDean: EvaluationSupervisorResult | null = submission
    ? { ratings: submission.ratings, comments: submission.comments ? [submission.comments] : [] }
    : null;
  const departmentChair = report?.departmentChair ?? null;
  const chairScore = supervisorEvaluationScore(data.criteria, departmentChair) ?? archivedSummary?.departmentChairScore ?? null;
  const deanScore = supervisorEvaluationScore(data.criteria, collegeDean) ?? archivedSummary?.deanScore ?? null;
  const pageCount = Math.max(1, Math.ceil(classes.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleClasses = classes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const studentComments = report?.studentComments ?? [];
  const supervisorComments = [
    ...(departmentChair?.comments ?? []).map((text) => ({ text, source: "Department Chair" })),
    ...(collegeDean?.comments ?? []).map((text) => ({ text, source: "College Dean" })),
  ];
  const sources = [
    { id: "dean", label: "College Dean SEF", assessment: collegeDean },
    { id: "chair", label: "Department Chair SEF", assessment: departmentChair },
  ];
  const reportDocument: FacultyEvaluationDocument = {
    instructor, term: evaluationTerm, classes, criteria: data.criteria,
    departmentChair, collegeDean, studentComments, archivedSummary,
  };

  function exportPdf() {
    try {
      const accent = getComputedStyle(globalThis.document.documentElement).getPropertyValue("--primary").trim();
      const pdf = createFacultyEvaluationPdf(reportDocument, accent);
      const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
      const link = globalThis.document.createElement("a");
      link.href = url;
      link.download = `faculty-evaluation-${instructor.id}-${reportDocument.term.academicYear.replace(/[^\d-]/g, "-")}-${reportDocument.term.semester}.pdf`;
      globalThis.document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Faculty evaluation report exported.");
    } catch {
      toast.error("Unable to export this report. Please try again.");
    }
  }

  return (
    <main className="faculty-results-page" aria-labelledby="faculty-results-title">
      <header className="faculty-results-heading">
        <div>
          <h2 id="faculty-results-title">Faculty Evaluation Results</h2>
          <p>Student SET, Department Chair SEF and College Dean SEF results for the {historicalTerm ? "selected historical term" : "current academic term"}.</p>
        </div>
        <div className="faculty-results-actions">
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer aria-hidden="true" />Print</Button>
          <Button type="button" onClick={exportPdf}><Download aria-hidden="true" />Export PDF</Button>
        </div>
      </header>

      <dl className="instructor-evaluation-faculty faculty-results-profile">
        <div><dt>FACULTY</dt><dd>{instructor.name}</dd></div>
        <div><dt>ACADEMIC RANK</dt><dd>{instructor.rank}</dd></div>
        <div><dt>DEPARTMENT</dt><dd>{instructor.department}</dd></div>
        <div><dt>ACADEMIC TERM</dt><dd>{evaluationTerm.semester === "first" ? "1st" : "2nd"} Semester · AY {evaluationTerm.academicYear}</dd></div>
      </dl>

      <div className="faculty-results-grid">
        <section className="faculty-results-panel faculty-results-ratings" aria-labelledby="faculty-results-ratings-title">
          <div className="faculty-results-panel-heading">
            <div><h3 id="faculty-results-ratings-title">Evaluation ratings</h3><p>{tab === "student" ? "Student feedback by subject and section" : "Independent supervisor ratings by benchmark"}</p></div>
            <span className="faculty-results-count">{tab === "student" ? `${classes.length} classes` : `${data.criteria.length} items`}</span>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="faculty-results-tabs">
            <TabsList variant="line" aria-label="Evaluation rating source">
              <TabsTrigger value="student">Student SET</TabsTrigger>
              {sources.map((source) => <TabsTrigger key={source.id} value={source.id}>{source.label}</TabsTrigger>)}
            </TabsList>
            <TabsContent value="student" className="faculty-results-tab-content">
              <div className="faculty-results-table-area">
                <Table className="faculty-results-class-table" containerProps={{ tabIndex: 0, role: "region", "aria-label": "Student evaluations by class" }}>
                  <TableHeader><TableRow>
                    <TableHead scope="col">#</TableHead><TableHead scope="col">Subject</TableHead><TableHead scope="col">Section</TableHead>
                    <TableHead scope="col">Responses /<br />Enrolled</TableHead><TableHead scope="col">Average</TableHead><TableHead scope="col">Weighted<br />score</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {visibleClasses.map((result, index) => <TableRow key={result.id}>
                      <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell><strong className="faculty-results-subject-code">{result.code}</strong><span className="faculty-results-subject-title">{result.title}</span></TableCell>
                      <TableCell>{result.section}</TableCell><TableCell>{result.responses}/{result.enrolled}</TableCell>
                      <TableCell className="faculty-results-average">{formatEvaluationScore(classEvaluationAverage(result))}</TableCell><TableCell>{count(result.totalScore)}</TableCell>
                    </TableRow>)}
                    {!classes.length && <TableRow><TableCell colSpan={6} className="faculty-results-empty">{historicalTerm ? "Archived class breakdowns are not available for this academic term." : "Student feedback is not available for this academic term."}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
              <div className="faculty-results-totals"><strong>All classes total</strong>{classBreakdownUnavailable ? <span>{classTotals}</span> : <><span>{count(summary.responses)} / {count(summary.enrolled)} responses</span><span>{count(summary.weightedScore)} weighted score</span></>}</div>
              <div className="faculty-results-pagination">
                <p aria-live="polite">{classes.length ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, classes.length)} of ${classes.length} classes` : "No class results"}</p>
                <nav aria-label="Class results pagination">
                  <Button type="button" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
                  {Array.from({ length: pageCount }, (_, index) => <Button key={index} type="button" variant={currentPage === index + 1 ? "default" : "outline"} aria-current={currentPage === index + 1 ? "page" : undefined} aria-label={`Class results page ${index + 1}`} onClick={() => setPage(index + 1)}>{index + 1}</Button>)}
                  <Button type="button" variant="outline" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button>
                </nav>
              </div>
            </TabsContent>
            {sources.map((source) => <TabsContent key={source.id} value={source.id} className="faculty-results-tab-content">
              <div className="faculty-results-table-area">
                <Table className="faculty-results-supervisor-table" containerProps={{ tabIndex: 0, role: "region", "aria-label": `${source.label} benchmark ratings` }}>
                  <TableHeader><TableRow><TableHead scope="col">#</TableHead><TableHead scope="col">Benchmark statement</TableHead><TableHead scope="col">Score</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {source.assessment ? data.criteria.map((criterion) => <TableRow key={criterion.id}>
                      <TableCell>{criterion.id}</TableCell><TableCell>{criterion.supervisorStatement ?? criterion.statement}</TableCell><TableCell>{source.assessment!.ratings[criterion.id] ?? "—"} / 5</TableCell>
                    </TableRow>) : <TableRow><TableCell colSpan={3} className="faculty-results-empty">{historicalTerm ? `Archived ${source.label} benchmark ratings are not available for this term.` : `No ${source.label} evaluation has been submitted for this term.`}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
              <div className="faculty-results-totals"><strong>{source.label} total</strong><span>{supervisorEvaluationPoints(data.criteria, source.assessment) ?? "—"} / {data.criteria.length * 5} points</span><span>{formatEvaluationScore(supervisorEvaluationScore(data.criteria, source.assessment))} / 100</span></div>
            </TabsContent>)}
          </Tabs>

          <div className="faculty-results-print-only">
            <h4>Student SET · All classes</h4>
            <table><thead><tr><th>Subject</th><th>Section</th><th>Responses / Enrolled</th><th>Average</th><th>Weighted score</th></tr></thead><tbody>
              {classes.map((result) => <tr key={result.id}><td>{result.code} · {result.title}</td><td>{result.section}</td><td>{result.responses}/{result.enrolled}</td><td>{formatEvaluationScore(classEvaluationAverage(result))}</td><td>{count(result.totalScore)}</td></tr>)}
            </tbody></table>
            <p>{classTotals}</p>
            {sources.map((source) => <section key={source.id}><h4>{source.label}</h4>
              {source.assessment ? <table><tbody>{data.criteria.map((criterion) => <tr key={criterion.id}><td>{criterion.id}. {criterion.supervisorStatement ?? criterion.statement}</td><td>{source.assessment!.ratings[criterion.id]} / 5</td></tr>)}</tbody></table> : <p>{historicalTerm ? "Archived benchmark ratings are not available." : "No evaluation submitted."}</p>}
            </section>)}
          </div>
        </section>

        <aside className="faculty-results-panel faculty-results-insights" aria-labelledby="faculty-results-insights-title">
          <h3 id="faculty-results-insights-title">Rating insights</h3>
          <p className="faculty-results-help">Sample data · {historicalTerm ? "Read-only historical results" : "Independent evaluator results"}</p>
          {archivedSummary && !departmentChair && !collegeDean && <p className="faculty-results-help">Archived chair and dean scores; benchmark ratings are not available.</p>}
          <div className="faculty-results-metrics">
            {[
              { label: "Student SET", score: studentScore, formula: <>SET = Σ(N<sub>c</sub> × R<sub>c</sub>) ÷ ΣN<sub>c</sub></> },
              { label: "Department Chair SEF", score: chairScore, formula: <>SEF = (Σ<sub>i=1</sub><sup>{data.criteria.length}</sup> S<sub>i</sub> ÷ {data.criteria.length * 5}) × 100</> },
              { label: "College Dean SEF", score: deanScore, formula: <>SEF = (Σ<sub>i=1</sub><sup>{data.criteria.length}</sup> S<sub>i</sub> ÷ {data.criteria.length * 5}) × 100</> },
            ].map((metric) => <div key={metric.label} className="faculty-results-metric">
              <div><h4>{metric.label}</h4><strong>{formatEvaluationScore(metric.score)}</strong></div>
              <meter min={0} max={100} value={metric.score ?? 0} aria-label={metric.label} aria-valuetext={metric.score === null ? "Not yet available" : `${formatEvaluationScore(metric.score)} out of 100`} />
              <p>{metric.formula}</p>
            </div>)}
          </div>
          <section className="faculty-results-performance" aria-labelledby="faculty-results-performance-title">
            <h4 id="faculty-results-performance-title">Student performance details</h4>
            <dl>
              <div><dt>Highest class rating</dt><dd>{summary.highestClass ? `${count(classEvaluationAverage(summary.highestClass)!)} · ${summary.highestClass.code}` : "—"}</dd></div>
              <div><dt>Lowest class rating</dt><dd>{summary.lowestClass ? `${count(classEvaluationAverage(summary.lowestClass)!)} · ${summary.lowestClass.code}` : "—"}</dd></div>
              <div><dt>Weighted SET score</dt><dd>{classBreakdownUnavailable ? "—" : count(summary.weightedScore)}</dd></div>
              <div title="Percentage of classes with at least one student response"><dt>Evaluation completion</dt><dd>{classBreakdownUnavailable ? "—" : `${count(summary.completion)}%`}</dd></div>
            </dl>
            <div className="faculty-results-response-count"><strong>{count(responseCount)}</strong><span>Student responses</span></div>
          </section>
          <section className="faculty-results-calculations" aria-labelledby="faculty-results-calculations-title">
            <h4 id="faculty-results-calculations-title">How to read the calculations</h4>
            <p>SET: N<sub>c</sub> = responses; R<sub>c</sub> = class rating.</p>
            <p>SEF: S<sub>i</sub> = one of the evaluator’s {data.criteria.length} item scores.</p>
            <p>Chair and Dean results are never combined.</p>
          </section>
        </aside>
      </div>

      <section className="faculty-results-panel faculty-results-comments" aria-labelledby="faculty-results-comments-title">
        <h3 id="faculty-results-comments-title">Qualitative comments and suggestions</h3>
        <div className="faculty-results-comment-columns">
          <section aria-labelledby="faculty-results-student-comments"><h4 id="faculty-results-student-comments"><Users aria-hidden="true" />Comments from students</h4>
            {studentComments.length ? <ol>{studentComments.map((comment, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{comment}</p></li>)}</ol> : <p className="faculty-results-help">No student comments were provided.</p>}
          </section>
          <section aria-labelledby="faculty-results-supervisor-comments"><h4 id="faculty-results-supervisor-comments"><UserRoundCheck aria-hidden="true" />Comments from supervisor</h4>
            {supervisorComments.length ? <ol>{supervisorComments.map((comment, index) => <li key={`${comment.source}-${index}`}><span aria-hidden="true">{index + 1}</span><p>{comment.text}<small>{comment.source}</small></p></li>)}</ol> : <p className="faculty-results-help">No supervisor comments were provided.</p>}
          </section>
        </div>
      </section>
    </main>
  );
}
