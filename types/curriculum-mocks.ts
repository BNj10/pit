import type { CurriculumManagementData, Semester, Subject } from "./curriculum-types";

// Builds a fixture subject; ids double as readable references below.
function subject(
  curriculumId: string,
  id: string,
  code: string,
  title: string,
  [yearLevel, semester]: [number, Semester],
  [lectureUnits, laboratoryUnits, units]: [number, number, number],
  prerequisiteIds: readonly string[] = [],
  corequisiteIds: readonly string[] = [],
): Subject {
  return {
    id,
    curriculumId,
    code,
    title,
    yearLevel,
    semester,
    lectureUnits,
    laboratoryUnits,
    units,
    prerequisiteIds,
    corequisiteIds,
  };
}

const c2026 = "curriculum-bscs-2026";
const c2019 = "curriculum-bscs-2019";
const c2015 = "curriculum-bscs-2015";

// Synthetic design preview. Replace with the authenticated Department Chair's
// assigned degree program, its curricula, and their subjects. Subject codes,
// titles, units, and requisites are fixtures, not the institution's curricula.
export const curriculumManagementPreview = {
  program: {
    id: "program-bscs",
    code: "BSCS",
    name: "Bachelor of Science in Computer Science",
    shortName: "BS Computer Science",
    yearLevels: 4,
  },
  curricula: [
    {
      id: c2026,
      name: "2026 BSCS Curriculum",
      year: 2026,
      implementedYear: 2026,
      status: "Draft",
      description: null,
    },
    {
      id: c2019,
      name: "2019 BSCS Curriculum",
      year: 2019,
      implementedYear: 2019,
      status: "Active",
      description: null,
    },
    {
      id: c2015,
      name: "2015 BSCS Curriculum",
      year: 2015,
      implementedYear: 2015,
      status: "Archived",
      description: null,
    },
  ],
  subjects: [
    subject(c2026, "s26-cc101", "CC 101", "Introduction to Computing", [1, "first"], [2, 1, 3]),
    subject(c2026, "s26-cc102", "CC 102", "Computer Programming 1", [1, "first"], [2, 1, 3]),
    subject(c2026, "s26-ge1", "GE 1", "Understanding the Self", [1, "first"], [3, 0, 3]),
    subject(c2026, "s26-cs103", "CS 103", "Object-Oriented Programming", [1, "second"], [2, 0, 2], ["s26-cc102"], ["s26-cs103l"]),
    subject(c2026, "s26-cs103l", "CS 103L", "Object-Oriented Programming Laboratory", [1, "second"], [0, 1, 1], ["s26-cc102"], ["s26-cs103"]),

    subject(c2019, "s19-cc101", "CC 101", "Introduction to Computing", [1, "first"], [2, 1, 3]),
    subject(c2019, "s19-cc102", "CC 102", "Computer Programming 1", [1, "first"], [2, 1, 3]),
    subject(c2019, "s19-ge1", "GE 1", "Understanding the Self", [1, "first"], [3, 0, 3]),
    subject(c2019, "s19-ge2", "GE 2", "Readings in Philippine History", [1, "first"], [3, 0, 3]),
    subject(c2019, "s19-ge3", "GE 3", "Mathematics in the Modern World", [1, "first"], [3, 0, 3]),
    subject(c2019, "s19-cs101", "CS 101", "Discrete Structures 1", [1, "first"], [3, 0, 3]),
    subject(c2019, "s19-pe1", "PE 1", "Movement Competency Training", [1, "first"], [2, 0, 2]),
    subject(c2019, "s19-nstp1", "NSTP 1", "National Service Training Program 1", [1, "first"], [3, 0, 3]),
    subject(c2019, "s19-cc103", "CC 103", "Computer Programming 2", [1, "second"], [2, 1, 3], ["s19-cc102"]),
    subject(c2019, "s19-cs102", "CS 102", "Discrete Structures 2", [1, "second"], [3, 0, 3], ["s19-cs101"]),
    subject(c2019, "s19-ge4", "GE 4", "Purposive Communication", [1, "second"], [3, 0, 3]),
    subject(c2019, "s19-ge5", "GE 5", "Ethics", [1, "second"], [3, 0, 3]),
    subject(c2019, "s19-pe2", "PE 2", "Exercise-Based Fitness Activities", [1, "second"], [2, 0, 2], ["s19-pe1"]),
    subject(c2019, "s19-nstp2", "NSTP 2", "National Service Training Program 2", [1, "second"], [3, 0, 3], ["s19-nstp1"]),
    subject(c2019, "s19-cc104", "CC 104", "Data Structures and Algorithms", [2, "first"], [2, 1, 3], ["s19-cc103"]),
    subject(c2019, "s19-cs201", "CS 201", "Object-Oriented Programming", [2, "first"], [2, 0, 2], ["s19-cc103"], ["s19-cs201l"]),
    subject(c2019, "s19-cs201l", "CS 201L", "Object-Oriented Programming Laboratory", [2, "first"], [0, 1, 1], ["s19-cc103"], ["s19-cs201"]),
    subject(c2019, "s19-ge6", "GE 6", "Art Appreciation", [2, "first"], [3, 0, 3]),
    subject(c2019, "s19-pe3", "PE 3", "Individual and Dual Sports", [2, "first"], [2, 0, 2], ["s19-pe2"]),
    subject(c2019, "s19-cc105", "CC 105", "Information Management", [2, "second"], [2, 1, 3], ["s19-cc104"]),
    subject(c2019, "s19-cs202", "CS 202", "Algorithms and Complexity", [2, "second"], [3, 0, 3], ["s19-cc104", "s19-cs102"]),
    subject(c2019, "s19-pe4", "PE 4", "Team Sports", [2, "second"], [2, 0, 2], ["s19-pe3"]),

    subject(c2015, "s15-cs111", "CS 111", "Introduction to Computing", [1, "first"], [2, 1, 3]),
    subject(c2015, "s15-cs112", "CS 112", "Fundamentals of Programming", [1, "first"], [2, 1, 3]),
    subject(c2015, "s15-cs121", "CS 121", "Intermediate Programming", [1, "second"], [2, 1, 3], ["s15-cs112"]),
  ],
} satisfies CurriculumManagementData;
