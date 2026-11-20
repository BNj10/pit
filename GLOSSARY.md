# PIT Enroll

The enrollment and academic records portal for PIT. It serves three portal roles: Students, Department Chairs, and Deans. An Administrator maintains the system outside the portal.

## People

**Role**:
One of exactly three kinds of portal account: Student, Department Chair, or Dean. No other portal role exists.
_Avoid_: Registrar, Supervisor, Faculty (as a role)

**Student**:
A user who enrolls in subjects, views their own academic records, and evaluates the faculty members who teach them.

**Department Chair**:
The user who runs enrollment and official records for one department, including posting grades.
_Avoid_: Registrar, Supervisor

**Dean**:
A user who leads all colleges in the university. Deans manage colleges, departments, and academic terms, and oversee all faculty evaluations. A Dean is not assigned to any one college, and there may be more than one Dean.
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

**Degree program**:
A course of study a student completes for a degree, such as Bachelor of Science in Computer Science, owned by one department. Each Department Chair manages one assigned degree program.
_Avoid_: Course (when meaning the whole program)

## Curricula

**Curriculum**:
The set of subjects a degree program requires, identified by its curriculum year (one curriculum per year in a program) and a code such as BSCS-2026. Its year implemented is the year it takes effect, with no set end; it may be several years after its curriculum year. A program may have several active curricula at once for different student cohorts.

**Subject**:
A course of study listed in one curriculum for one year level and term (1st semester, 2nd semester, or Summer), identified by a code unique within that curriculum. It records lecture, laboratory, and total units separately; no rule derives one from the others. Subjects can be added, edited, or deleted only while their curriculum is a draft.
_Avoid_: Course (when meaning one subject)

**Prerequisite**:
A subject that must come before another, always from an earlier term in the same curriculum. A subject that another subject requires cannot be deleted or moved to that subject's term or later.

**Corequisite**:
A subject taken together with another in the same term of the same curriculum. The relation is mutual.

**Curriculum status**:
Draft, Active, or Archived. Only a draft can be edited. A Department Chair activates a draft directly, with no approval step; deactivating returns an active curriculum to draft. Archiving a draft makes it and its subjects read-only until restored to draft. A draft or archived curriculum can be permanently deleted with its subjects; an active one cannot.

## Calendar

**Academic term**:
A school year and semester, shared by the whole school and created by a Dean.
_Avoid_: Department term

**Enrollment period**:
The window within an academic term when one department accepts enrollment. Each Department Chair opens and closes it for their own department.
_Avoid_: Enrollment calendar (when meaning one department's window)

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
