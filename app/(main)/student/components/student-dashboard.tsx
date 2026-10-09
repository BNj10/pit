import { ClipboardCheck, FileText, Undo2, UserCheck, UserRound } from "lucide-react";

import { DashboardQuickActionCard } from "@/components/shared/dashboard/dashboard-quick-action-card";
import { DashboardSummaryCard } from "@/components/shared/dashboard/dashboard-summary-card";
import { portalRoleConfig } from "@/role-config";
import { EnrollmentFeedbackCard, type EnrollmentFeedback } from "./enrollment-feedback-card";

export interface StudentDashboardData {
  studentStatus: string;
  studentStatusDescription: string;
  enrollmentStatus: string;
  enrollmentStatusDescription: string;
  feedback: EnrollmentFeedback | null;
}

const studentConfig = portalRoleConfig.student;
const academicRecordsHref = studentConfig.navigation.find((item) => item.icon === "records")!.href;
const evaluationHref = studentConfig.navigation.find((item) => item.icon === "evaluation")!.href;
const enrollmentHref = studentConfig.navigation.find((item) => item.icon === "enrollment")!.href;

export function StudentDashboard({ data }: { data: StudentDashboardData }) {
  return (
    <div className="space-y-[22px]">
      <div className="space-y-[5px]">
        <h2 className="text-2xl font-semibold">Student Dashboard</h2>
        <p className="text-[13px] text-muted-foreground">
          View your enrollment status and quickly access your academic information.
        </p>
      </div>
      <section aria-label="Student and enrollment status" className="grid gap-4 sm:grid-cols-2">
        <DashboardSummaryCard
          label="Student status"
          value={data.studentStatus}
          description={data.studentStatusDescription}
          icon={<UserCheck />}
          variant="status"
        />
        <DashboardSummaryCard
          label="Enrollment status"
          value={data.enrollmentStatus}
          description={data.enrollmentStatusDescription}
          icon={data.feedback ? <Undo2 /> : <ClipboardCheck />}
          variant="status"
          tone={data.feedback ? "destructive" : "default"}
        />
      </section>
      <nav aria-labelledby="student-quick-actions" className="space-y-3.5">
        <h3 id="student-quick-actions" className="text-base font-bold">Quick actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardQuickActionCard
            title="Academic records"
            description="Review grades and prerequisites"
            href={academicRecordsHref}
            icon={<FileText />}
          />
          <DashboardQuickActionCard
            title="Student account"
            description="Check your profile and contact details"
            href={studentConfig.account.href}
            icon={<UserRound />}
          />
          <DashboardQuickActionCard
            title="Instructor evaluation"
            description="Access your available evaluations"
            href={evaluationHref}
            icon={<ClipboardCheck />}
          />
        </div>
      </nav>
      <section aria-label="Department Chair enrollment feedback">
        <EnrollmentFeedbackCard feedback={data.feedback} enrollmentHref={enrollmentHref} />
      </section>
    </div>
  );
}
