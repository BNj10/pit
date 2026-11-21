"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Archive } from "lucide-react";

import { useEvaluation } from "@/components/shared/faculty-evaluation/evaluation-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { evaluationTermLabel, formatEvaluationScore } from "@/lib/faculty-evaluation";
import { ArchiveResultAction } from "./archive-result-action";
import { EvaluationWindowSettings } from "./evaluation-window-settings";

export function EvaluationManagement() {
  const { results: allResults, archivedResultIds } = useEvaluation();
  const [yearFilter, setYearFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const historyHeadingRef = useRef<HTMLHeadingElement>(null);
  // Archived results stay in the data; they are only hidden until shown.
  const listed = allResults.filter((result) => showArchived || !archivedResultIds.includes(result.id));
  const archivedCount = allResults.filter((result) => archivedResultIds.includes(result.id)).length;
  const years = [...new Set(listed.map((result) => result.academicYear))];
  // Archiving can remove the selected year from the list; fall back to all years.
  const activeYear = yearFilter === "all" || years.includes(yearFilter) ? yearFilter : "all";
  const results = listed.filter(
    (result) => activeYear === "all" || result.academicYear === activeYear,
  );
  const focusHistory = () => historyHeadingRef.current?.focus();

  return (
    <main className="faculty-evaluation-page" aria-labelledby="faculty-evaluation-title">
      <div className="faculty-evaluation-page-heading">
        <div>
          <h2 id="faculty-evaluation-title">Evaluation management</h2>
          <p>Manage semester evaluation windows and review previous terms.</p>
        </div>
      </div>

      <EvaluationWindowSettings />

      <section
        className="faculty-evaluation-panel faculty-evaluation-history"
        aria-labelledby="evaluation-history-title"
      >
        <div className="faculty-evaluation-section-heading">
          <div>
            <h3 id="evaluation-history-title" ref={historyHeadingRef} tabIndex={-1}>Previous semester results</h3>
            <p>Aggregated evaluation results by completed academic term.</p>
          </div>
          <div className="faculty-evaluation-history-controls">
            {(archivedCount > 0 || showArchived) && (
              <Button
                type="button"
                variant="outline"
                className="faculty-evaluation-archived-toggle"
                aria-pressed={showArchived}
                onClick={() => setShowArchived((current) => !current)}
              >
                <Archive aria-hidden="true" />
                Show archived ({archivedCount})
              </Button>
            )}
            <Select value={activeYear} onValueChange={setYearFilter}>
              <SelectTrigger
                aria-label="Filter results by academic year"
                className="faculty-evaluation-year-filter"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All academic years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table
          className="faculty-evaluation-results-table"
          containerProps={{
            tabIndex: 0,
            role: "region",
            "aria-label": "Previous semester evaluation results",
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Academic term</TableHead>
              <TableHead scope="col">Faculty</TableHead>
              <TableHead scope="col">Responses</TableHead>
              <TableHead scope="col">Student SET</TableHead>
              <TableHead scope="col">Dept. Chair SEF</TableHead>
              <TableHead scope="col">Dean SEF</TableHead>
              <TableHead scope="col">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const archived = archivedResultIds.includes(result.id);
              return (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {evaluationTermLabel(result)}
                    {archived && <span className="faculty-evaluation-archived-badge">Archived</span>}
                  </TableCell>
                  <TableCell>{result.facultyCount}</TableCell>
                  <TableCell>{result.responseCount.toLocaleString("en-US")}</TableCell>
                  <TableCell>{formatEvaluationScore(result.studentScore)}</TableCell>
                  <TableCell>{formatEvaluationScore(result.departmentChairScore)}</TableCell>
                  <TableCell>{formatEvaluationScore(result.deanScore)}</TableCell>
                  <TableCell>
                    <div className="faculty-evaluation-result-actions">
                      <Button asChild variant="link">
                        <Link
                          href={{
                            pathname: "/dean/faculty-evaluation/historical-term-results",
                            query: { term: result.id },
                          }}
                          aria-label={`View results for ${evaluationTermLabel(result)}`}
                        >
                          View results
                        </Link>
                      </Button>
                      <ArchiveResultAction result={result} archived={archived} onDone={focusHistory} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  {listed.length === 0 && archivedCount > 0
                    ? "All completed results are archived. Choose Show archived to see them."
                    : "No completed evaluation results are available for this academic year."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="faculty-evaluation-history-note">
          Aggregate ratings only · No individual respondent identities are displayed. Archiving hides a term from this
          list and keeps all of its results.
        </p>
      </section>
    </main>
  );
}
