"use client";

import { useState } from "react";
import Link from "next/link";

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
import { EvaluationWindowSettings } from "./evaluation-window-settings";

export function EvaluationManagement() {
  const { results: allResults } = useEvaluation();
  const [yearFilter, setYearFilter] = useState("all");
  const years = [...new Set(allResults.map((result) => result.academicYear))];
  const results = allResults.filter(
    (result) => yearFilter === "all" || result.academicYear === yearFilter,
  );

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
            <h3 id="evaluation-history-title">Previous semester results</h3>
            <p>Aggregated evaluation results by completed academic term.</p>
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
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
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{evaluationTermLabel(result)}</TableCell>
                <TableCell>{result.facultyCount}</TableCell>
                <TableCell>{result.responseCount.toLocaleString("en-US")}</TableCell>
                <TableCell>{formatEvaluationScore(result.studentScore)}</TableCell>
                <TableCell>{formatEvaluationScore(result.departmentChairScore)}</TableCell>
                <TableCell>{formatEvaluationScore(result.deanScore)}</TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  No completed evaluation results are available for this academic year.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="faculty-evaluation-history-note">
          Aggregate ratings only · No individual respondent identities are displayed.
        </p>
      </section>
    </main>
  );
}
