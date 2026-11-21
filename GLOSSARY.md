# PIT Enroll

The enrollment and academic records portal for PIT. It serves three portal roles: Students, Department Chairs, and Deans. An Administrator maintains the system outside the portal.

## People

**Role**:
One of exactly three kinds of portal account: Student, Department Chair, or Dean. No other portal role exists.
_Avoid_: Registrar, Supervisor, Faculty (as a role)

**Student**:
A user who enrolls in subjects, views their own academic records, and evaluates the faculty members who teach them.

**Department Chair**:
The user who reviews and approves enrollment and keeps official records for one department, including posting grades.
_Avoid_: Registrar, Supervisor

**Dean**:
A user who leads all colleges in the university. Deans manage colleges, departments, academic years and terms, and the enrollment schedule, and oversee all faculty evaluations. A Dean is not assigned to any one college, and there may be more than one Dean.
_Avoid_: Supervisor

**Administrator**:
The person who maintains the system through direct database access. Creates all user accounts and registers faculty member profiles. Not a portal role.
_Avoid_: Registrar, Admin role

**Faculty member**:
A person who teaches sections, listed under exactly one department. Faculty members have a profile in the system but no account and no access. A Department Chair who teaches also has a separate faculty member profile.
_Avoid_: Instructor (allowed only as a student-facing label), Faculty user

## Organization

**College**:
An academic unit made up of departments.

**Department**:
An academic unit within a college. Each department is run by one Department Chair.

## Calendar

**Academic year**:
A school year, such as 2025–2026, created by a Dean with all three academic terms. It is Draft until activated, then Active, then Completed; only one academic year is active at a time. It can be marked completed only while Summer is its current term.
_Avoid_: School calendar

**Academic term**:
One term of an academic year, shared by the whole school: 1st semester, 2nd semester, or Summer. Terms have no dates; a Dean starts each term, which completes the previous one.
_Avoid_: Department term, Midyear

**Enrollment schedule**:
The Dean's school-wide plan for when students may enroll in one academic term: one window per year level, followed by open enrollment. It applies to every department and opens and closes on its own once published. Each window can be published on its own; students whose window isn't published yet see no enrollment, and published students can enroll only while their window is open.
_Avoid_: Enrollment calendar

**Enrollment period**:
The time within an academic term when students may enroll, made up of the windows in the term's enrollment schedule.

**Open enrollment**:
The last window of an enrollment schedule, for irregular students and those who missed their year-level window. Eligibility checks still apply.

**Section**:
A scheduled class of one subject in an academic term, taught by one faculty member. The Department Chair of the offering department assigns its schedule and a faculty member from that same department.

**Subject approval**:
A Department Chair's approval of the subjects a student chose for an academic term. Only the chair of the student's own department gives it. Approval produces the Certificate of Enrollment.

**Certificate of Enrollment**:
The document a student receives after subject approval and takes to other offices for signatures. Signing is done in person, outside the system.

**Enrolled**:
The status a Department Chair gives a student once their Certificate of Enrollment is fully signed. Before that, an approved student is awaiting signatures.

## Grades

**Draft grade**:
A grade the Department Chair has entered but not yet published. Students cannot see it.

**Published grade**:
A grade the Department Chair of the student's own department has released to the student's academic records. Faculty members submit grades to that chair, and the chair decides the grade; grades from another department reach that chair through the offering department's chair. The chair may publish at any time, down to a single subject's grade. A published grade can still be corrected.
_Avoid_: Posted grade, Uploaded grade

**INC**:
A grade given to a student who did not submit all the requirements needed to be graded.
_Avoid_: Incomplete status

**Pending**:
What a student sees for a grade that is not yet published, whether it is blank or still a draft.
_Avoid_: Not yet available, Ungraded

**DROP**:
A grade marking a subject the student dropped.
_Avoid_: Withdrawn

## Evaluation

**Faculty evaluation**:
An assessment of a faculty member's performance, given by a Student, a Department Chair, or a Dean. Always identify it by who gave it: student evaluation, chair evaluation, or dean evaluation.
_Avoid_: Supervisor evaluation

**Rating**:
A score given inside a faculty evaluation.
_Avoid_: using "rating" to mean the whole evaluation

**Archived result**:
A completed term's evaluation results that a Dean has hidden from the results history. Its ratings and comments are kept, and it can be restored.
_Avoid_: Deleted results
