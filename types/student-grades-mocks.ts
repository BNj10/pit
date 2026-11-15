import type { StudentGrade, StudentGradesData, StudentGradeSubject } from "./student-grades-types";

// Synthetic design fixtures, including the scale shown in the reference.
// These are not an institutional grade scale, GPA policy, or active term.
export const studentGradeOptions: readonly StudentGrade[] = [
  1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 5, "INC", "DROP",
];

const subjects: readonly Pick<StudentGradeSubject, "code" | "title">[] = [
  { code: "CS 315", title: "Database Systems" },
  { code: "CS 307", title: "Operating Systems" },
  { code: "CS 321", title: "Software Engineering" },
  { code: "GE 108", title: "Ethics" },
  { code: "MATH 210", title: "Probability & Statistics" },
  { code: "CS 323", title: "Web Development" },
];

const completedGrades = {
  subjects: subjects.map((subject) => ({ ...subject, midterm: 1.75, final: 1.75 })),
};

export const facultyGradesPreview: StudentGradesData = {
  initialSemester: "2026-2027-first",
  semesters: [
    { value: "2026-2027-first", label: "1st Semester · AY 2026–2027", schoolYearStatus: "current" },
    { value: "2024-2025-second", label: "2nd Semester · AY 2024–2025", schoolYearStatus: "completed" },
  ],
  subjects,
  records: {
    "2024-2025-second": {
      draft: completedGrades,
      published: completedGrades,
    },
  },
};

