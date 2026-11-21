import type {
  AcademicTerm,
  FacultyMember,
  OfferingTermGroup,
  SectionEntry,
  SectionsSourceData,
  SubjectOffering,
} from "./sections-types";

// Synthetic preview fixtures based on the supplied design. Rooms, terms, and schedules are not
// an institutional timetable. Offerings point to subjects in types/curriculum-mocks.ts.
const previewFaculty: readonly FacultyMember[] = [
  { id: "reyes", name: "Engr. Maria L. Reyes", department: "Computer Science" },
  { id: "santos", name: "Dr. Paolo V. Santos", department: "Computer Science" },
  { id: "garcia", name: "Prof. Liza M. Garcia", department: "Computer Science" },
  { id: "tan", name: "Engr. Victor A. Tan", department: "Computer Science" },
];

// Terms a Dean has created; chairs choose from these when adding a semester.
const previewAcademicTerms: readonly AcademicTerm[] = [
  { academicYear: "2025–2026", term: "first" },
  { academicYear: "2025–2026", term: "second" },
  { academicYear: "2025–2026", term: "summer" },
  { academicYear: "2026–2027", term: "first" },
];

const previewTermGroups: readonly OfferingTermGroup[] = [
  { academicYear: "2025–2026", yearLevel: 2, term: "first" },
  { academicYear: "2025–2026", yearLevel: 3, term: "first" },
  { academicYear: "2025–2026", yearLevel: 3, term: "second" },
  { academicYear: "2025–2026", yearLevel: 4, term: "first" },
];

// Most offerings come from the 2023 curriculum. One Third Year subject still comes from 2019,
// and one Fourth Year subject from the archived 2015 curriculum, to show mixed curricula.
const previewOfferings: readonly SubjectOffering[] = [
  { id: "y2-first-cs2101", academicYear: "2025–2026", yearLevel: 2, term: "first", subjectId: "s23-cs2101", crossDepartmentAccess: { mode: "open" } },
  { id: "y2-first-cs2102", academicYear: "2025–2026", yearLevel: 2, term: "first", subjectId: "s23-cs2102", crossDepartmentAccess: { mode: "open" } },
  { id: "y3-first-cs3101", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectId: "s23-cs3101", crossDepartmentAccess: { mode: "scheduled", opensAt: "2026-12-07T08:00" } },
  { id: "y3-first-cs3102", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectId: "s23-cs3102", crossDepartmentAccess: { mode: "scheduled", opensAt: "2026-12-07T08:00" } },
  { id: "y3-first-cs3103", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectId: "s23-cs3103", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs3201", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectId: "s23-cs3201", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs3202", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectId: "s23-cs3202", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs3203", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectId: "s23-cs3203", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs307", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectId: "s19-cs307", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y4-first-cs401", academicYear: "2025–2026", yearLevel: 4, term: "first", subjectId: "s19-cs401", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y4-first-cs411", academicYear: "2025–2026", yearLevel: 4, term: "first", subjectId: "s15-cs411", crossDepartmentAccess: { mode: "reserved" } },
];

// Each section block meets one hour per unit. BSCS 3-B has no CS 3101 laboratory yet, so the
// editor shows a shortfall that blocks publishing Third Year.
const previewEntries: readonly SectionEntry[] = [
  { id: "cs3101-3a-lec", offeringId: "y3-first-cs3101", subjectCode: "CS 3101", section: "BSCS 3-A", classType: "lecture", facultyId: "reyes", capacity: 40, days: ["M", "W"], startTime: "08:00", endTime: "09:00", room: "ENG 204" },
  { id: "cs3101-3b-lec", offeringId: "y3-first-cs3101", subjectCode: "CS 3101", section: "BSCS 3-B", classType: "lecture", facultyId: "santos", capacity: 40, days: ["T", "Th"], startTime: "13:00", endTime: "14:00", room: "ENG 205" },
  { id: "cs3101-3a-lab", offeringId: "y3-first-cs3101", subjectCode: "CS 3101", section: "BSCS 3-A", classType: "laboratory", facultyId: "reyes", capacity: 30, days: ["F"], startTime: "08:00", endTime: "09:00", room: "LAB 2" },
  { id: "cs3102-3a-lec", offeringId: "y3-first-cs3102", subjectCode: "CS 3102", section: "BSCS 3-A", classType: "lecture", facultyId: "garcia", capacity: 40, days: ["T", "Th"], startTime: "08:00", endTime: "09:00", room: "ENG 204" },
  { id: "cs3102-3a-lab", offeringId: "y3-first-cs3102", subjectCode: "CS 3102", section: "BSCS 3-A", classType: "laboratory", facultyId: null, capacity: 30, days: ["Sa"], startTime: "08:00", endTime: "09:00", room: "TBA" },
  { id: "cs2101-2a-lec", offeringId: "y2-first-cs2101", subjectCode: "CS 2101", section: "BSCS 2-A", classType: "lecture", facultyId: "tan", capacity: 40, days: ["M", "W"], startTime: "10:00", endTime: "11:00", room: "ENG 201" },
  { id: "cs2101-2a-lab", offeringId: "y2-first-cs2101", subjectCode: "CS 2101", section: "BSCS 2-A", classType: "laboratory", facultyId: "tan", capacity: 30, days: ["F"], startTime: "10:00", endTime: "11:00", room: "LAB 1" },
  { id: "cs2102-2a-lec", offeringId: "y2-first-cs2102", subjectCode: "CS 2102", section: "BSCS 2-A", classType: "lecture", facultyId: "garcia", capacity: 40, days: ["T", "Th"], startTime: "10:00", endTime: "11:00", room: "ENG 201" },
  { id: "cs2102-2a-lab", offeringId: "y2-first-cs2102", subjectCode: "CS 2102", section: "BSCS 2-A", classType: "laboratory", facultyId: "garcia", capacity: 30, days: ["F"], startTime: "13:00", endTime: "14:00", room: "LAB 1" },
];

export const sectionsPreview = {
  department: "Computer Science",
  faculty: previewFaculty,
  academicTerms: previewAcademicTerms,
  initialAcademicYear: "2025–2026",
  initialYearLevel: 3,
  termGroups: previewTermGroups,
  offerings: previewOfferings,
  entries: previewEntries,
  publishedYearLevels: [{ academicYear: "2025–2026", yearLevel: 2 }],
} satisfies SectionsSourceData;
