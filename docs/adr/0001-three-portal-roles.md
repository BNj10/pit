# Three portal roles; administration happens outside the portal

PIT Enroll has exactly three portal roles: Student, Department Chair, and Dean. There is no registrar, administrator, or faculty login. The Administrator maintains the system through direct database access: they create every user account and register faculty member profiles. There is no administrator UI for now. Faculty members have profiles (used for faculty evaluations) but no accounts.

The Department Chair of a student's own department approves that student's subjects and enters, decides, and publishes all of that student's grades, including grades for subjects offered by other departments. Faculty members hand grades to chairs outside the system, and chairs get other departments' grades from those departments' chairs. Deans lead all colleges and have school-wide authority over colleges, departments, academic terms, and faculty evaluations.

We chose this to keep the portal to the three roles that match how PIT runs. Do not add a registrar, admin, or faculty role to the portal, or move grade posting away from the student's own chair, without revisiting this decision.
