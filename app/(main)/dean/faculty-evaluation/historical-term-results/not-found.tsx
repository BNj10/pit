import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HistoricalTermNotFound() {
  return (
    <main className="faculty-evaluation-page" aria-labelledby="historical-term-not-found">
      <div className="faculty-evaluation-page-heading">
        <div>
          <h2 id="historical-term-not-found">Term results unavailable</h2>
          <p>This historical term could not be found. Select a term from the evaluation history.</p>
        </div>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link href="/dean/faculty-evaluation#evaluation-history-title">Back to term history</Link>
        </Button>
      </div>
    </main>
  );
}
