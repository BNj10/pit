import type { SubjectsEnrolledData } from "./subjects-enrolled-types";

// Approved-only preview data. Replace with authenticated enrollment data.
export const subjectsEnrolledPreview: SubjectsEnrolledData = {
  term: "1st Semester · A.Y. 2025–2026",
  subjects: [
    { code: "EE 12", title: "Electrical Standards & Practice", section: "BSEE IV-A", classrooms: ["EELab1"], instructor: null, lectureUnits: 0, labUnits: 1 },
    { code: "EE 13", title: "Electrical Systems & Illumination Engineering Design", section: "BSEE IV-A", classrooms: ["TBA-03", "TBA-04"], instructor: null, lectureUnits: 3, labUnits: 2 },
    { code: "EE 14", title: "EE Elective 2: Renewable Energy for Sustainable Development", section: "BSEE IV-A", classrooms: ["FIELD 01"], instructor: null, lectureUnits: 2, labUnits: 1 },
    { code: "EE 16", title: "Instrumentation & Control", section: "BSEE IV-A", classrooms: ["TBA-04"], instructor: null, lectureUnits: 2, labUnits: 1 },
    { code: "EE 21", title: "Research Project or Capstone Design Project", section: "BSEE IV-A", classrooms: ["Comp-Lab."], instructor: null, lectureUnits: 0, labUnits: 1 },
    { code: "GE 4A", title: "Management of Engineering Projects", section: "BSEE IV-A", classrooms: ["Comp-Lab."], instructor: null, lectureUnits: 2, labUnits: 0 },
    { code: "GE 6A", title: "Materials Science & Engineering", section: "BSEE IV-A", classrooms: ["Comp-Lab."], instructor: null, lectureUnits: 2, labUnits: 0 },
    { code: "GE 7A", title: "Environmental Science & Engineering", section: "BSEE IV-A", classrooms: ["TBA-03"], instructor: null, lectureUnits: 2, labUnits: 0 },
    { code: "GE 9", title: "Enhancement of Engineering Mathematics", section: "BSEE IV-A", classrooms: ["TBA-03"], instructor: null, lectureUnits: 0, labUnits: 2 },
  ],
};

export const notYetEnrolledPreview: SubjectsEnrolledData = {
  term: subjectsEnrolledPreview.term,
  subjects: [],
};
