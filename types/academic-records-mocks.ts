import type { AcademicRecordsData } from "./academic-records-types";

// Synthetic preview fixtures. These years, grades, statuses, and GPA values
// are design examples, not the active institutional term or grading policy.
export const academicRecordsPreview: AcademicRecordsData = {
  initialSemesterValue: "2025-2026-first",
  semesterGroups: [
    {
      year: "2025–2026",
      semesters: [
        { value: "2025-2026-first", label: "1st Semester · AY 2025–2026" },
      ],
    },
    {
      year: "2024–2025",
      semesters: [
        { value: "2024-2025-summer", label: "Summer · AY 2024–2025" },
        { value: "2024-2025-second", label: "2nd Semester · AY 2024–2025" },
        { value: "2024-2025-first", label: "1st Semester · AY 2024–2025" },
      ],
    },
    {
      year: "2023–2024",
      semesters: [
        { value: "2023-2024-summer", label: "Summer · AY 2023–2024" },
        { value: "2023-2024-second", label: "2nd Semester · AY 2023–2024" },
        { value: "2023-2024-first", label: "1st Semester · AY 2023–2024" },
      ],
    },
  ],
  records: {
    "2025-2026-first": {
      id: "first-semester",
      title: "First semester academic record",
      term: "1st Semester · A.Y. 2025–2026",
      gpa: 1.90,
      subjects: [
        { code: "EE 12", title: "Electrical Standards & Practice", units: 1 },
        { code: "EE 13", title: "Electrical Systems & Illumination Engineering Design", units: 5 },
        { code: "EE 14", title: "EE Elective 2: Renewable Energy for Sustainable Development", units: 3 },
        { code: "EE 16", title: "Instrumentation & Control", units: 3 },
        { code: "EE 21", title: "Research Project or Capstone Design Project", units: 1 },
        { code: "GE 4A", title: "Management of Engineering Projects", units: 2 },
        { code: "GE 6A", title: "Materials Science & Engineering", units: 2 },
        { code: "GE 7A", title: "Environmental Science & Engineering", units: 2 },
        { code: "GE 9", title: "Enhancement of Engineering Mathematics", units: 2 },
      ].map((subject) => ({
        ...subject,
        section: "BSEE IV-A",
        midterm: null,
        final: null,
        status: "Pending",
      })),
    },
    "2024-2025-summer": {
      id: "summer-2024-2025",
      title: "Summer academic record",
      term: "Summer · A.Y. 2024–2025",
      gpa: 1.38,
      subjects: [
        {
          code: "EE 11",
          title: "Power Systems Analysis",
          section: "BSEE III-S",
          units: 3,
          midterm: 1.75,
          final: 1.5,
          status: "Passed",
        },
        {
          code: "GE 5",
          title: "Engineering Economics",
          section: "BSEE III-S",
          units: 3,
          midterm: 1.5,
          final: 1.25,
          status: "Passed",
        },
      ],
    },
    "2024-2025-second": null,
    "2024-2025-first": null,
    "2023-2024-summer": null,
    "2023-2024-second": null,
    "2023-2024-first": null,
  },
};
