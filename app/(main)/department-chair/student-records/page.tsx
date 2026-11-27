import { studentRecordsHref } from "@/role-config";

import { StudentRecordsContent } from "./components/student-records-content";

export default function StudentRecordsPage() {
  return <StudentRecordsContent recordsHref={`${studentRecordsHref}/grades`} />;
}
