"use client";

import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { classTypeLabels, countLabel, describeSectionSchedule, formatSectionSchedule, subjectSectionsId } from "@/lib/sections";
import type { SubjectSectionsProps } from "@/types/sections-exports";

export function SubjectSections({
  subject,
  offering,
  entries,
  expanded,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onRemove,
}: SubjectSectionsProps) {
  const panelId = subjectSectionsId(offering.id);

  return (
    <section className="subject-sections" data-expanded={expanded} aria-label={`${subject.code} ${subject.title}`}>
      <div className="subject-sections-header">
        <h5 className="subject-sections-heading">
          <button id={`${panelId}-toggle`} type="button" aria-expanded={expanded} aria-controls={panelId} onClick={onToggle}>
            <span className="subject-sections-title">
              <span className="subject-sections-code">{subject.code}</span>
              <span>{subject.title}</span>
            </span>
            <span className="subject-sections-count" data-empty={entries.length === 0}>
              {entries.length === 0 ? "No schedule yet" : countLabel(entries.length, "schedule")}
              {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </span>
          </button>
        </h5>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="sections-remove-button"
          aria-haspopup="dialog"
          aria-label={`Remove ${subject.code} from this term`}
          title="Remove subject"
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      {expanded && (
        <div id={panelId} className="subject-sections-panel">
          {entries.length > 0 ? (
            <Table
              className="subject-sections-table"
              containerProps={{
                tabIndex: 0,
                role: "region",
                "aria-label": `${subject.code} section schedules`,
              }}
            >
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Section</TableHead>
                  <TableHead scope="col">Type</TableHead>
                  <TableHead scope="col">Schedule</TableHead>
                  <TableHead scope="col">Room</TableHead>
                  <TableHead scope="col">Capacity</TableHead>
                  <TableHead scope="col" className="subject-sections-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const label = `${entry.section} ${classTypeLabels[entry.classType].label.toLocaleLowerCase()}`;
                  return (
                    <TableRow key={entry.id}>
                      <TableHead scope="row" className="subject-sections-section">{entry.section}</TableHead>
                      <TableCell>
                        <abbr title={classTypeLabels[entry.classType].label}>{classTypeLabels[entry.classType].short}</abbr>
                      </TableCell>
                      <TableCell>
                        <span aria-hidden="true">{formatSectionSchedule(entry)}</span>
                        <span className="sr-only">{describeSectionSchedule(entry)}</span>
                      </TableCell>
                      <TableCell>{entry.room}</TableCell>
                      <TableCell>{entry.capacity}</TableCell>
                      <TableCell className="subject-sections-actions">
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="subject-sections-edit"
                            aria-haspopup="dialog"
                            aria-label={`Edit ${label}`}
                            onClick={() => onEdit(entry)}
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="subject-sections-delete"
                            aria-haspopup="dialog"
                            aria-label={`Delete ${label}`}
                            onClick={() => onDelete(entry)}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="subject-sections-empty">No sections are scheduled for {subject.code} yet.</p>
          )}
          <div className="subject-sections-footer">
            <Button type="button" variant="outline" aria-haspopup="dialog" onClick={onAdd}>
              {entries.length > 0 ? "Add another section" : "Add section"}
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
