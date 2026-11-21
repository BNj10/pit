import { redirect } from "next/navigation";

// Keep the directory's intermediate breadcrumb URL usable.
export default async function CollegeDepartmentsPage({ params }: { params: Promise<{ collegeId: string }> }) {
  const { collegeId } = await params;
  redirect(`/dean/colleges-and-departments/${encodeURIComponent(collegeId)}`);
}
