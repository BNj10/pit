import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HistoricalTermRecords } from "./components/historical-term-records";

export const metadata: Metadata = {
  title: "Historical Term Results | PIT Enroll",
  description: "Read-only faculty evaluation results for a completed academic term.",
};

export default async function HistoricalTermResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string | string[] }>;
}) {
  const { term } = await searchParams;
  if (Array.isArray(term)) notFound();

  return <HistoricalTermRecords termId={term} />;
}
