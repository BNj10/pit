import { StudentRecordsContent } from "@/app/(main)/department-chair/student-records/components/student-records-content";
import { getStudentRecordsHref } from "@/role-config";
import { studentRecordsPreview } from "@/types/student-records-exports";

export default function StudentRecordsPage() {
  return <StudentRecordsContent data={studentRecordsPreview} recordsHref={`${getStudentRecordsHref("dean")}/grades`} />;
}
