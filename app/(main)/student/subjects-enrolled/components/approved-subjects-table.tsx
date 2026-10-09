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
      <div className="flex min-h-16 flex-col justify-center gap-1.5 px-5 py-1.5">
        <h2 id="approved-subjects-title" className="text-xl font-bold">
          Currently enrolled subjects
        </h2>
        <p id="approved-subjects-term" className="text-xs text-muted-foreground">{term}</p>
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
        className="min-w-[1052px] table-fixed"
      >
        <colgroup>
          <col className="w-[98px]" />
          <col />
          <col className="w-[104px]" />
          <col className="w-[156px]" />
          <col className="w-[76px]" />
          <col className="w-[76px]" />
          <col className="w-[90px]" />
        </colgroup>
        <TableHeader className="bg-[#f4f4f5]">
          <TableRow className="h-9 hover:bg-transparent [&_th]:h-9 [&_th]:px-1.5 [&_th]:text-[10px] [&_th]:font-bold [&_th]:text-muted-foreground">
            <TableHead scope="col" className="pl-5!">CODE</TableHead>
            <TableHead scope="col">SUBJECT TITLE</TableHead>
            <TableHead scope="col">SECTION</TableHead>
            <TableHead scope="col">INSTRUCTOR</TableHead>
            <TableHead scope="col" className="text-center">LEC UNITS</TableHead>
            <TableHead scope="col" className="text-center">LAB UNITS</TableHead>
            <TableHead scope="col" className="pr-5! text-center">TOTAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.code} className="h-12 even:bg-surface-hover hover:bg-transparent even:hover:bg-surface-hover [&_td]:px-1.5">
              <TableHead scope="row" className="pr-1.5 pl-5 text-[13px] font-semibold">{subject.code}</TableHead>
              <TableCell className="text-xs whitespace-normal break-words">{subject.title}</TableCell>
              <TableCell className="text-[13px] text-muted-foreground">{subject.section}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {subject.instructor ?? <span aria-label="Instructor not yet assigned">-</span>}
              </TableCell>
              <TableCell className="text-center text-[13px] text-muted-foreground">{subject.lectureUnits.toFixed(1)}</TableCell>
              <TableCell className="text-center text-[13px] text-muted-foreground">{subject.labUnits.toFixed(1)}</TableCell>
              <TableCell className="pr-5! text-center text-[13px] font-semibold">{(subject.lectureUnits + subject.labUnits).toFixed(1)}</TableCell>
            </TableRow>
          ))}
          {subjects.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                No approved subjects for this term yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-2.5">
        <p className="text-[11px] text-muted-foreground">Only subjects approved by the administrator are shown.</p>
        <p className="text-[13px] font-bold text-primary">
          {subjects.length} {subjects.length === 1 ? "SUBJECT" : "SUBJECTS"} · {totalUnits} {totalUnits === 1 ? "UNIT" : "UNITS"}
        </p>
      </div>
    </section>
  );
}
