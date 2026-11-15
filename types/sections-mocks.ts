import type { CurriculumSubject, OfferingTermGroup, SectionEntry, SectionsData, SubjectOffering } from "./sections-types";

// Synthetic preview fixtures based on the supplied design. These subjects, hours,
// rooms, and schedules are not an approved curriculum or institutional timetable.
const previewSubjects: readonly CurriculumSubject[] = [
  { code: "CS 101", title: "Introduction to Computing", units: 3, yearLevel: 1, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 102", title: "Computer Programming 1", units: 3, yearLevel: 1, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 103", title: "Computer Programming 2", units: 3, yearLevel: 1, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 201", title: "Data Structures and Algorithms", units: 3, yearLevel: 2, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 202", title: "Discrete Structures", units: 3, yearLevel: 2, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 203", title: "Object-Oriented Programming", units: 3, yearLevel: 2, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 301", title: "Software Engineering", units: 3, yearLevel: 3, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 3 },
  { code: "CS 302", title: "Operating Systems", units: 3, yearLevel: 3, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 3 },
  { code: "CS 305", title: "Web Systems & Technologies", units: 3, yearLevel: 3, semester: 1, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 303", title: "Automata Theory and Formal Languages", units: 3, yearLevel: 3, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 304", title: "Information Assurance and Security", units: 3, yearLevel: 3, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 306", title: "Computer Networks", units: 3, yearLevel: 3, semester: 2, lectureHoursPerWeek: 2, laboratoryHoursPerWeek: 3 },
  { code: "CS 307", title: "Human-Computer Interaction", units: 3, yearLevel: 3, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 401", title: "CS Thesis 1", units: 3, yearLevel: 4, semester: 1, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
  { code: "CS 402", title: "CS Thesis 2", units: 3, yearLevel: 4, semester: 2, lectureHoursPerWeek: 3, laboratoryHoursPerWeek: 0 },
];

const previewTermGroups: readonly OfferingTermGroup[] = [
  { yearLevel: 2, term: "first" },
  { yearLevel: 3, term: "first" },
  { yearLevel: 3, term: "second" },
];

const previewOfferings: readonly SubjectOffering[] = [
  { id: "y2-first-cs201", yearLevel: 2, term: "first", subjectCode: "CS 201" },
  { id: "y2-first-cs202", yearLevel: 2, term: "first", subjectCode: "CS 202" },
  { id: "y3-first-cs301", yearLevel: 3, term: "first", subjectCode: "CS 301" },
  { id: "y3-first-cs302", yearLevel: 3, term: "first", subjectCode: "CS 302" },
  { id: "y3-first-cs305", yearLevel: 3, term: "first", subjectCode: "CS 305" },
  { id: "y3-second-cs303", yearLevel: 3, term: "second", subjectCode: "CS 303" },
  { id: "y3-second-cs304", yearLevel: 3, term: "second", subjectCode: "CS 304" },
  { id: "y3-second-cs306", yearLevel: 3, term: "second", subjectCode: "CS 306" },
  { id: "y3-second-cs307", yearLevel: 3, term: "second", subjectCode: "CS 307" },
];

const previewEntries: readonly SectionEntry[] = [
  { id: "cs301-3a-lec", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-A", classType: "lecture", capacity: 40, days: ["M", "W"], startTime: "08:00", endTime: "09:30", room: "ENG 204" },
  { id: "cs301-3b-lec", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-B", classType: "lecture", capacity: 40, days: ["T", "Th"], startTime: "13:00", endTime: "14:30", room: "ENG 205" },
  { id: "cs301-3a-lab", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-A", classType: "laboratory", capacity: 30, days: ["F"], startTime: "08:00", endTime: "11:00", room: "LAB 2" },
  { id: "cs301-3b-lab", offeringId: "y3-first-cs301", subjectCode: "CS 301", section: "BSCS 3-B", classType: "laboratory", capacity: 30, days: ["F"], startTime: "13:00", endTime: "16:00", room: "LAB 3" },
  { id: "cs302-3a-lec", offeringId: "y3-first-cs302", subjectCode: "CS 302", section: "BSCS 3-A", classType: "lecture", capacity: 40, days: ["T", "Th"], startTime: "08:00", endTime: "09:30", room: "ENG 204" },
  { id: "cs302-3a-lab", offeringId: "y3-first-cs302", subjectCode: "CS 302", section: "BSCS 3-A", classType: "laboratory", capacity: 30, days: ["Sa"], startTime: "08:00", endTime: "11:00", room: "LAB 2" },
  { id: "cs201-2a-lec", offeringId: "y2-first-cs201", subjectCode: "CS 201", section: "BSCS 2-A", classType: "lecture", capacity: 40, days: ["M", "W"], startTime: "10:00", endTime: "11:00", room: "ENG 201" },
];

export const sectionsPreview = {
  program: "BS Computer Science",
  initialYearLevel: 3,
  subjects: previewSubjects,
  termGroups: previewTermGroups,
  offerings: previewOfferings,
  entries: previewEntries,
} satisfies SectionsData;
