import type { EnrollmentData } from "./enrollment-types";

// UI fixtures from design OTNNs. These are not live offerings or an enrollment request.
export const enrollmentPreview: EnrollmentData = {
  term: "A.Y. 2025–2026 · 1st Semester",
  unitLimit: 21,
  initialEnrollmentIds: ["ee-12", "ee-13", "ee-14", "ee-16", "ee-21", "ge-4a", "ge-6a", "ge-7a", "ge-9"],
  initialSelectedIds: ["ee-12"],
  offerings: [
    { id: "ee-12", code: "EE 12", title: "Electrical Standards & Practice", department: "Electrical Engineering", section: "BSEE IV-A", schedule: "M 8:00AM–11:00AM", rooms: "EELab1", lectureUnits: 0, labUnits: 1 },
    { id: "ee-13", code: "EE 13", title: "Electrical Systems & Illumination Engineering Design", department: "Electrical Engineering", section: "BSEE IV-A", schedule: "MTW 5:00PM–8:00PM", rooms: "TBA-03\nTBA-03\nTBA-04", lectureUnits: 3, labUnits: 2 },
    { id: "ee-14", code: "EE 14", title: "EE Elective 2: Renewable Energy for Sustainable Development", department: "Electrical Engineering", section: "BSEE IV-A", schedule: "W 3:00PM–5:00PM\nW 7:00AM–10:00AM", rooms: "FIELD 01\nFIELD 01", lectureUnits: 2, labUnits: 1 },
    { id: "ee-16", code: "EE 16", title: "Instrumentation & Control", department: "Electrical Engineering", section: "BSEE IV-A", schedule: "F 1:00PM–3:00PM\nF 3:00PM–6:00PM", rooms: "TBA-04\nTBA-04", lectureUnits: 2, labUnits: 1 },
    { id: "ee-21", code: "EE 21", title: "Research Project or Capstone Design Project", department: "Electrical Engineering", section: "BSEE IV-A", schedule: "TH 1:00PM–4:00PM", rooms: "Comp-Lab.", lectureUnits: 0, labUnits: 1 },
    { id: "ge-4a", code: "GE 4A", title: "Management of Engineering Projects", department: "General Education", section: "BSEE IV-A", schedule: "T 1:00PM–3:00PM", rooms: "Comp-Lab.", lectureUnits: 2, labUnits: 0 },
    { id: "ge-6a", code: "GE 6A", title: "Materials Science & Engineering", department: "General Education", section: "BSEE IV-A", schedule: "MW 1:00PM–2:00PM", rooms: "Comp-Lab.", lectureUnits: 2, labUnits: 0 },
    { id: "ge-7a", code: "GE 7A", title: "Environmental Science & Engineering", department: "General Education", section: "BSEE IV-A", schedule: "W 10:00AM–12:00PM", rooms: "TBA-03", lectureUnits: 2, labUnits: 0 },
    { id: "ge-9", code: "GE 9", title: "Enhancement of Engineering Mathematics", department: "General Education", section: "BSEE IV-A", schedule: "TH 9:00AM–12:00PM", rooms: "TBA-03", lectureUnits: 0, labUnits: 2 },
  ],
};
