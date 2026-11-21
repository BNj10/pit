import type { EnrollmentData } from "./enrollment-types";

// UI fixtures from design OTNNs. These are not live offerings or an enrollment request.
export const enrollmentPreview: EnrollmentData = {
  term: "A.Y. 2025–2026 · 1st Semester",
  unitLimit: 21,
  initialEnrollmentIds: ["ee-12", "ee-13", "ee-14", "ee-16", "ee-21", "ge-4a", "ge-6a", "ge-7a", "ge-9"],
  initialSelectedIds: ["ee-12"],
  // Simulated requirements for the test subjects below, not university curriculum rules.
  requirementIssues: [
    { offeringId: "test-prerequisite", requiredSubjectCode: "TEST 100", type: "prerequisite", message: "Mock scenario: TEST 100 has not been completed. Remove TEST 102 from the summary to clear this test error." },
    { offeringId: "test-corequisite", requiredSubjectCode: "TEST 099", type: "corequisite", message: "Mock scenario: the required companion subject TEST 099 is missing. Remove TEST 103 from the summary to clear this test error." },
  ],
  offerings: [
    { id: "ee-12", code: "EE 12", title: "Electrical Standards & Practice", department: "Electrical Engineering", section: "BSEE IV-A", rooms: "EELab1", lectureUnits: 0, labUnits: 1, meetings: [{ days: ["M"], start: 480, end: 660 }] },
    { id: "ee-13", code: "EE 13", title: "Electrical Systems & Illumination Engineering Design", department: "Electrical Engineering", section: "BSEE IV-A", rooms: "TBA-03\nTBA-03\nTBA-04", lectureUnits: 3, labUnits: 2, meetings: [{ days: ["M", "T", "W"], start: 1020, end: 1200 }] },
    { id: "ee-14", code: "EE 14", title: "EE Elective 2: Renewable Energy for Sustainable Development", department: "Electrical Engineering", section: "BSEE IV-A", rooms: "FIELD 01\nFIELD 01", lectureUnits: 2, labUnits: 1, meetings: [{ days: ["W"], start: 900, end: 1020 }, { days: ["W"], start: 420, end: 600 }] },
    { id: "ee-16", code: "EE 16", title: "Instrumentation & Control", department: "Electrical Engineering", section: "BSEE IV-A", rooms: "TBA-04\nTBA-04", lectureUnits: 2, labUnits: 1, meetings: [{ days: ["F"], start: 780, end: 900 }, { days: ["F"], start: 900, end: 1080 }] },
    { id: "ee-21", code: "EE 21", title: "Research Project or Capstone Design Project", department: "Electrical Engineering", section: "BSEE IV-A", rooms: "Comp-Lab.", lectureUnits: 0, labUnits: 1, meetings: [{ days: ["TH"], start: 780, end: 960 }] },
    { id: "ge-4a", code: "GE 4A", title: "Management of Engineering Projects", department: "General Education", section: "BSEE IV-A", rooms: "Comp-Lab.", lectureUnits: 2, labUnits: 0, meetings: [{ days: ["T"], start: 780, end: 900 }] },
    { id: "ge-6a", code: "GE 6A", title: "Materials Science & Engineering", department: "General Education", section: "BSEE IV-A", rooms: "Comp-Lab.", lectureUnits: 2, labUnits: 0, meetings: [{ days: ["M", "W"], start: 780, end: 840 }] },
    { id: "ge-7a", code: "GE 7A", title: "Environmental Science & Engineering", department: "General Education", section: "BSEE IV-A", rooms: "TBA-03", lectureUnits: 2, labUnits: 0, meetings: [{ days: ["W"], start: 600, end: 720 }] },
    { id: "ge-9", code: "GE 9", title: "Enhancement of Engineering Mathematics", department: "General Education", section: "BSEE IV-A", rooms: "TBA-03", lectureUnits: 0, labUnits: 2, meetings: [{ days: ["TH"], start: 540, end: 720 }] },
    // Search TEST, or search "Dialog tests" by Department. Refresh between scenarios to restore the 21-unit load.
    {
      id: "test-schedule-conflict", code: "TEST 101", title: "Mock: Schedule conflict with EE 12 (non-credit)",
      department: "Dialog tests", section: "MOCK-A", rooms: "Mock room",
      lectureUnits: 0, labUnits: 0, meetings: [{ days: ["M"], start: 540, end: 600 }],
    },
    {
      id: "test-prerequisite", code: "TEST 102", title: "Mock: Missing prerequisite (non-credit)",
      department: "Dialog tests", section: "MOCK-A", rooms: "Mock room",
      lectureUnits: 0, labUnits: 0, meetings: [{ days: ["S"], start: 480, end: 540 }],
    },
    {
      id: "test-corequisite", code: "TEST 103", title: "Mock: Missing corequisite (non-credit)",
      department: "Dialog tests", section: "MOCK-A", rooms: "Mock room",
      lectureUnits: 0, labUnits: 0, meetings: [{ days: ["S"], start: 540, end: 600 }],
    },
    {
      id: "test-unit-limit", code: "TEST 104", title: "Mock: Block additions above the unit limit (adds 3 units)",
      department: "Dialog tests", section: "MOCK-A", rooms: "Mock room",
      lectureUnits: 3, labUnits: 0, meetings: [{ days: ["S"], start: 600, end: 780 }],
    },
  ],
};
