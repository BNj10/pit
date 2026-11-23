import { studentRecordsHref } from "@/role-config";
import { studentRecordsPreview } from "@/types/student-records-exports";

import { StudentRecordsContent } from "./components/student-records-content";

export default function StudentRecordsPage() {
  return <StudentRecordsContent data={studentRecordsPreview} recordsHref={`${studentRecordsHref}/grades`} />;
}
