import type { FacultyEvaluationDocument } from "@/types/faculty-evaluation-types";
import { evaluationTermLabel, formatEvaluationScore } from "./faculty-evaluation";
import { classEvaluationAverage, summarizeClassEvaluations, supervisorEvaluationScore } from "./faculty-evaluation-results";

/** A standalone, paginated PDF report using the standard PDF Helvetica fonts. */
export function createFacultyEvaluationPdf(report: FacultyEvaluationDocument, accent = "#025043") {
  const width = 595;
  const height = 842;
  const margin = 40;
  const pages: string[] = [];
  let operations: string[] = [];
  let y = height - margin;
  let runningSection = "";
  const hex = /^#([a-f\d]{6})$/i.exec(accent)?.[1] ?? "025043";
  const brand = [0, 2, 4].map((index) => (parseInt(hex.slice(index, index + 2), 16) / 255).toFixed(3)).join(" ");
  const summary = summarizeClassEvaluations(report.classes);

  function plain(value: string) {
    return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/·/g, "|").replace(/[^\x20-\x7e\n]/g, " ");
  }
  function literal(value: string) {
    return plain(value).replace(/([\\()])/g, "\\$1");
  }
  function text(value: string, x: number, baseline: number, size = 10, bold = false, color = "0.12 0.12 0.12") {
    operations.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color} rg 1 0 0 1 ${x} ${baseline} Tm (${literal(value)}) Tj ET`);
  }
  function ensure(space: number) {
    if (y - space >= 52) return;
    pages.push(operations.join("\n"));
    operations = [];
    y = height - margin;
    text("Faculty Evaluation Results - continued", margin, y, 13, true, brand);
    y -= 26;
    if (runningSection) {
      text(runningSection, margin, y, 11, true, brand);
      y -= 22;
    }
  }
  function wrap(value: string, availableWidth: number, size = 10) {
    const limit = Math.max(8, Math.floor(availableWidth / (size * 0.59)));
    const words = plain(value).split(/\s+/).flatMap((word) => {
      const chunks: string[] = [];
      for (let offset = 0; offset < word.length; offset += limit) chunks.push(word.slice(offset, offset + limit));
      return chunks;
    });
    const lines = [""];
    for (const word of words) {
      if (lines.at(-1)!.length + word.length + 1 > limit) lines.push(word);
      else lines[lines.length - 1] += (lines.at(-1) ? " " : "") + word;
    }
    return lines;
  }
  function paragraph(value: string, size = 10, bold = false, color = "0.12 0.12 0.12") {
    for (const line of wrap(value, width - margin * 2, size)) {
      ensure(size + 6);
      text(line, margin, y, size, bold, color);
      y -= size + 5;
    }
  }
  function section(value: string) {
    ensure(42);
    runningSection = value;
    y -= 12;
    paragraph(value, 12, true, brand);
    y -= 4;
  }

  paragraph("Faculty Evaluation Results", 20, true, brand);
  paragraph(`${report.instructor.name} | ${report.instructor.rank}`, 11, true);
  paragraph(`${report.instructor.department} | ${evaluationTermLabel(report.term)}`, 9);
  section("Independent rating insights");
  paragraph(`Student SET: ${formatEvaluationScore(report.archivedSummary ? report.archivedSummary.studentScore : summary.studentScore)} / 100`, 11, true);
  if (report.archivedSummary) {
    paragraph(`Archived student responses: ${report.archivedSummary.responseCount}`, 9);
  }
  const chairScore = supervisorEvaluationScore(report.criteria, report.departmentChair) ?? report.archivedSummary?.departmentChairScore ?? null;
  const deanScore = supervisorEvaluationScore(report.criteria, report.collegeDean) ?? report.archivedSummary?.deanScore ?? null;
  paragraph(`Department Chair SEF: ${formatEvaluationScore(chairScore)} / 100`, 11, true);
  paragraph(`College Dean SEF: ${formatEvaluationScore(deanScore)} / 100`, 11, true);
  paragraph("Student SET is weighted by student responses. Chair and dean scores are never combined.", 9);

  section(`Student evaluation of teaching - ${report.classes.length} classes`);
  const columns = [210, 75, 75, 65, 90];
  const headings = ["Subject", "Section", "Responses", "Average", "Weighted score"];
  let x = margin;
  operations.push(`0.95 0.96 0.96 rg ${margin} ${y - 23} ${width - margin * 2} 28 re f`);
  headings.forEach((heading, index) => {
    text(heading, x + 5, y - 12, 8, true);
    x += columns[index];
  });
  y -= 30;
  for (const result of report.classes) {
    const values = [
      `${result.code} - ${result.title}`,
      result.section,
      `${result.responses} / ${result.enrolled}`,
      formatEvaluationScore(classEvaluationAverage(result)),
      result.totalScore.toLocaleString("en-US"),
    ];
    const wrapped = values.map((value, index) => wrap(value, columns[index] - 10, 8));
    const rowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 12 + 12;
    ensure(rowHeight);
    x = margin;
    wrapped.forEach((lines, index) => {
      lines.forEach((line, lineIndex) => text(line, x + 5, y - 10 - lineIndex * 12, 8));
      x += columns[index];
    });
    y -= rowHeight;
    operations.push(`0.87 0.89 0.89 RG 0.5 w ${margin} ${y + 3} m ${width - margin} ${y + 3} l S`);
  }
  y -= 10;
  paragraph(report.archivedSummary && !report.classes.length
    ? "Archived class breakdowns are not available for this term."
    : `All classes: ${summary.responses} / ${summary.enrolled} responses | ${summary.weightedScore.toLocaleString("en-US")} weighted score`, 9, true);

  for (const [label, assessment] of [
    ["College Dean SEF", report.collegeDean],
    ["Department Chair SEF", report.departmentChair],
  ] as const) {
    section(label);
    if (!assessment) {
      paragraph(report.archivedSummary ? "Archived benchmark ratings are not available for this term." : "No evaluation has been submitted.", 9);
      continue;
    }
    for (const criterion of report.criteria) {
      const lines = wrap(`${criterion.id}. ${criterion.supervisorStatement ?? criterion.statement}`, width - margin * 2 - 70, 9);
      ensure(lines.length * 13 + 8);
      text(`${assessment.ratings[criterion.id] ?? "-"} / 5`, width - margin - 40, y, 9, true);
      lines.forEach((line) => { text(line, margin, y, 9); y -= 13; });
      y -= 6;
    }
    paragraph(`SEF = sum of ${report.criteria.length} item scores / ${report.criteria.length * 5} x 100 = ${formatEvaluationScore(supervisorEvaluationScore(report.criteria, assessment))}`, 9, true);
  }

  section("Qualitative comments and suggestions");
  for (const [label, comments] of [
    ["Comments from students", report.studentComments],
    ["Comments from Department Chair", report.departmentChair?.comments ?? []],
    ["Comments from College Dean", report.collegeDean?.comments ?? []],
  ] as const) {
    ensure(42);
    paragraph(label, 10, true);
    if (!comments.length) paragraph("No comments provided.", 9);
    comments.forEach((comment, index) => paragraph(`${index + 1}. ${comment}`, 9));
    y -= 8;
  }
  pages.push(operations.join("\n"));

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  pages.forEach((page, index) => {
    const content = `${page}\nBT /F1 8 Tf 0.45 0.45 0.45 rg 1 0 0 1 ${margin} 28 Tm (Page ${index + 1} of ${pages.length}) Tj ET\n`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + index * 2} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  });
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const crossReference = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  return `${pdf}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReference}\n%%EOF\n`;
}
