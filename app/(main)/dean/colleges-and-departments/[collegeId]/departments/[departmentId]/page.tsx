import { redirect } from "next/navigation";

export default async function DepartmentPage({ params }: { params: Promise<{ collegeId: string; departmentId: string }> }) {
  const { collegeId, departmentId } = await params;
  redirect(`/dean/colleges-and-departments/${encodeURIComponent(collegeId)}/departments/${encodeURIComponent(departmentId)}/faculty`);
}
