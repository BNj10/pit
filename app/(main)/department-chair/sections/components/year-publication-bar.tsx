import { CircleAlert, Save, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { YearPublicationBarProps } from "@/types/sections-exports";

const statusLabels = {
  published: "Published",
  draft: "Draft",
  unsaved: "Unsaved changes",
} as const;

export function YearPublicationBar({ yearLabel, status, everPublished, blockers, onSaveDraft, onPublish }: YearPublicationBarProps) {
  const blocked = status !== "published" && blockers.length > 0;
  const description = status === "published"
    ? `Students can enroll in these ${yearLabel.toLocaleLowerCase()} offerings.`
    : everPublished
      ? "Students still see the last published version until you publish these changes."
      : "Not visible to students until published.";

  return (
    <div className="sections-publication" data-status={status}>
      <div className="sections-publication-copy">
        <p>
          <Badge variant="secondary" className="sections-publication-badge">{statusLabels[status]}</Badge>
          <span>{description}</span>
        </p>
        {blocked && (
          <p id="sections-publication-blockers" className="sections-publication-blockers">
            <CircleAlert aria-hidden="true" />
            {blockers.join(" ")}
          </p>
        )}
      </div>
      <div className="sections-publication-actions">
        <Button type="button" variant="outline" disabled={status !== "unsaved"} onClick={onSaveDraft}>
          <Save aria-hidden="true" />
          Save draft
        </Button>
        <Button
          type="button"
          disabled={status === "published" || blocked}
          aria-describedby={blocked ? "sections-publication-blockers" : undefined}
          aria-haspopup="dialog"
          onClick={onPublish}
        >
          <Send aria-hidden="true" />
          Publish {yearLabel}
        </Button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{`${yearLabel}: ${statusLabels[status]}.`}</p>
    </div>
  );
}
