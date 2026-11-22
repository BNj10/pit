import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ApprovedSubject {
  code: string;
  title: string;
  section: string;
  classrooms: readonly string[];
  instructor: string | null;
  lectureUnits: number;
  labUnits: number;
}

export function ApprovedSubjectsTable({
  subjects,
  term,
}: {
  subjects: readonly ApprovedSubject[];
  term: string;
}) {
  const totalUnits = subjects.reduce(
    (total, subject) => total + subject.lectureUnits + subject.labUnits,
    0,
  );

  return (
    <section data-page="subjects-enrolled" className="overflow-hidden rounded-lg border border-border bg-background" aria-labelledby="approved-subjects-title">
      <div className="flex min-h-24 flex-col justify-center gap-1.5 px-6 py-4">
        <h2 id="approved-subjects-title" className="text-[22px] font-bold">
          Currently enrolled subjects
        </h2>
        <p id="approved-subjects-term" className="text-[13px] text-muted-foreground">{term}</p>
      </div>
      <Table
        containerProps={{
          role: "region",
          "aria-label": "Approved subject details; scroll horizontally to view all columns",
          tabIndex: 0,
          className: "table-scroll focus-visible:-outline-offset-2",
        }}
        aria-labelledby="approved-subjects-title"
        aria-describedby="approved-subjects-term"
        className="min-w-[1052px] table-fixed leading-[1.35]"
      >
        <colgroup>
          <col />
          <col className="w-32" />
          <col className="w-32" />
          <col className="w-[184px]" />
          <col className="w-24" />
          <col className="w-[100px]" />
        </colgroup>
        <TableHeader className="bg-muted">
          <TableRow className="h-12 hover:bg-transparent [&_th]:h-12 [&_th]:px-3 [&_th]:text-[10px] [&_th]:font-bold [&_th]:text-muted-foreground">
            <TableHead scope="col" className="pl-6!">CODE / SUBJECT TITLE</TableHead>
            <TableHead scope="col">SECTION</TableHead>
            <TableHead scope="col">CLASSROOM</TableHead>
            <TableHead scope="col">INSTRUCTOR</TableHead>
            <TableHead scope="col" className="text-center">
              <span aria-hidden="true">LEC/LAB</span>
              <span className="sr-only">Lecture / laboratory units</span>
            </TableHead>
            <TableHead scope="col" className="pr-6! text-center">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.code} className="h-18 even:bg-surface-hover hover:bg-transparent even:hover:bg-surface-hover [&_td]:px-3 [&_td]:py-2">
              <TableHead scope="row" className="py-2 pr-3 pl-6 whitespace-normal break-words">
                <span className="block text-[13px] font-semibold">{subject.code}</span>
                <span className="mt-1.5 block text-xs font-normal">{subject.title}</span>
              </TableHead>
              <TableCell className="text-[13px] text-muted-foreground">{subject.section}</TableCell>
              <TableCell className="text-[13px] whitespace-normal break-words text-muted-foreground">
                {subject.classrooms.length > 0
                  ? subject.classrooms.map((classroom) => <span key={classroom} className="block">{classroom}</span>)
                  : "Not specified"}
              </TableCell>
              <TableCell className="text-[13px] whitespace-normal break-words text-muted-foreground">
                {subject.instructor ?? "Not specified"}
              </TableCell>
              <TableCell className="text-center text-[13px] text-muted-foreground">
                {subject.lectureUnits.toFixed(1)}/{subject.labUnits.toFixed(1)}
              </TableCell>
              <TableCell className="pr-6! text-center text-[13px] font-semibold">{(subject.lectureUnits + subject.labUnits).toFixed(1)}</TableCell>
            </TableRow>
          ))}
          {subjects.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                No approved subjects for this term yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <p className="text-xs text-muted-foreground">Only subjects approved by your department chair are shown.</p>
        <p className="shrink-0 text-[13px] font-bold text-primary">
          {subjects.length} {subjects.length === 1 ? "SUBJECT" : "SUBJECTS"} · {totalUnits} {totalUnits === 1 ? "UNIT" : "UNITS"}
        </p>
      </div>
    </section>
  );
}
