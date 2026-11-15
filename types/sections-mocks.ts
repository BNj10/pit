import type {
  AcademicTerm,
  CurriculumSubject,
  FacultyMember,
  OfferingTermGroup,
  SectionEntry,
  SectionsData,
  SubjectOffering,
} from "./sections-types";

// Synthetic preview fixtures based on the supplied design. These subjects, units, hours,
// rooms, terms, and schedules are not an approved curriculum or institutional timetable.
const previewSubjects: readonly CurriculumSubject[] = [
  { code: "CS 101", title: "Introduction to Computing", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 1, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 102", title: "Computer Programming 1", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 1, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 103", title: "Computer Programming 2", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 1, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 201", title: "Data Structures and Algorithms", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 2, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 202", title: "Discrete Structures", lectureUnits: 3, laboratoryUnits: 0, yearLevel: 2, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 203", title: "Object-Oriented Programming", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 2, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 301", title: "Software Engineering", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 3, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 3 },
  { code: "CS 302", title: "Operating Systems", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 3, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 3 },
  { code: "CS 305", title: "Web Systems & Technologies", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 3, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 303", title: "Automata Theory and Formal Languages", lectureUnits: 3, laboratoryUnits: 0, yearLevel: 3, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 304", title: "Information Assurance and Security", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 3, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 306", title: "Computer Networks", lectureUnits: 2, laboratoryUnits: 1, yearLevel: 3, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 307", title: "Human-Computer Interaction", lectureUnits: 3, laboratoryUnits: 0, yearLevel: 3, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 401", title: "CS Thesis 1", lectureUnits: 3, laboratoryUnits: 0, yearLevel: 4, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 402", title: "CS Thesis 2", lectureUnits: 3, laboratoryUnits: 0, yearLevel: 4, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
];

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
];

const previewOfferings: readonly SubjectOffering[] = [
  { id: "y2-first-cs201", academicYear: "2025–2026", yearLevel: 2, term: "first", subjectCode: "CS 201", crossDepartmentAccess: { mode: "open" } },
  { id: "y2-first-cs202", academicYear: "2025–2026", yearLevel: 2, term: "first", subjectCode: "CS 202", crossDepartmentAccess: { mode: "open" } },
  { id: "y3-first-cs301", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectCode: "CS 301", crossDepartmentAccess: { mode: "scheduled", opensAt: "2026-12-07T08:00" } },
  { id: "y3-first-cs302", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectCode: "CS 302", crossDepartmentAccess: { mode: "scheduled", opensAt: "2026-12-07T08:00" } },
  { id: "y3-first-cs305", academicYear: "2025–2026", yearLevel: 3, term: "first", subjectCode: "CS 305", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs303", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectCode: "CS 303", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs304", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectCode: "CS 304", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs306", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectCode: "CS 306", crossDepartmentAccess: { mode: "reserved" } },
  { id: "y3-second-cs307", academicYear: "2025–2026", yearLevel: 3, term: "second", subjectCode: "CS 307", crossDepartmentAccess: { mode: "reserved" } },
];

const previewEntries: readonly SectionEntry[] = [
  { id: "cs301-3a-lec", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-A", classType: "lecture", facultyId: "reyes", capacity: 40, days: ["M", "W"], startTime: "08:00", endTime: "09:30", room: "ENG 204" },
  { id: "cs301-3b-lec", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-B", classType: "lecture", facultyId: "santos", capacity: 40, days: ["T", "Th"], startTime: "13:00", endTime: "14:30", room: "ENG 205" },
  { id: "cs301-3a-lab", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-A", classType: "laboratory", facultyId: "reyes", capacity: 30, days: ["F"], startTime: "08:00", endTime: "11:00", room: "LAB 2" },
  { id: "cs301-3b-lab", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-B", classType: "laboratory", facultyId: "santos", capacity: 30, days: ["F"], startTime: "13:00", endTime: "16:00", room: "LAB 3" },
  { id: "cs302-3a-lec", offeringId: "y3-first-cs302", subjectCode: "CS 302", section: "BSCS 3-A", classType: "lecture", facultyId: "garcia", capacity: 40, days: ["T", "Th"], startTime: "08:00", endTime: "09:30", room: "ENG 204" },
  { id: "cs302-3a-lab", offeringId: "y3-first-cs302", subjectCode: "CS 302", section: "BSCS 3-A", classType: "laboratory", facultyId: null, capacity: 30, days: ["Sa"], startTime: "08:00", endTime: "11:00", room: "TBA" },
  { id: "cs201-2a-lec", offeringId: "y2-first-cs201", subjectCode: "CS 201", section: "BSCS 2-A", classType: "lecture", facultyId: "tan", capacity: 40, days: ["M", "W"], startTime: "10:00", endTime: "11:00", room: "ENG 201" },
  { id: "cs202-2a-lec", offeringId: "y2-first-cs202", subjectCode: "CS 202", section: "BSCS 2-A", classType: "lecture", facultyId: "garcia", capacity: 40, days: ["T", "Th"], startTime: "10:00", endTime: "11:30", room: "ENG 201" },
];

export const sectionsPreview = {
  program: "BS Computer Science",
  department: "Computer Science",
  faculty: previewFaculty,
  academicTerms: previewAcademicTerms,
  initialAcademicYear: "2025–2026",
  initialYearLevel: 3,
  subjects: previewSubjects,
  termGroups: previewTermGroups,
  offerings: previewOfferings,
  entries: previewEntries,
  publishedYearLevels: [{ academicYear: "2025–2026", yearLevel: 2 }],
} satisfies SectionsData;
