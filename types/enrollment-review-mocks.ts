import type {
  EnrollmentClassPart,
  EnrollmentClassType,
  EnrollmentManagementData,
  EnrollmentMeetingDay,
  EnrollmentStatus,
  EnrollmentSubject,
  EnrollmentTerm,
  EnrollmentYearLevel,
  StudentEnrollment,
} from "./enrollment-review-types";

// Synthetic preview fixtures. Students, subjects, schedules, rooms, and dates are design
// examples, not institutional records or an approved curriculum.
const terms: readonly EnrollmentTerm[] = [
  { id: "2025-2026-first", academicYear: "2025–2026", term: "first" },
  { id: "2024-2025-second", academicYear: "2024–2025", term: "second" },
];

type SubjectTemplate = Omit<EnrollmentSubject, "section">;

function classPart(
  classType: EnrollmentClassType,
  units: number,
  days: readonly EnrollmentMeetingDay[],
  startTime: string,
  endTime: string,
  room: string,
): EnrollmentClassPart {
  return { classType, units, meetings: [{ days, startTime, endTime, room }] };
}

type PartArgs = [units: number, days: readonly EnrollmentMeetingDay[], startTime: string, endTime: string, room: string];
const lecture = (...args: PartArgs) => classPart("lecture", ...args);
const laboratory = (...args: PartArgs) => classPart("laboratory", ...args);

// 4th-year subjects follow the supplied enrollment design; other years are similar BSEE examples.
const subjectsByYear: Record<EnrollmentYearLevel, readonly SubjectTemplate[]> = {
  1: [
    { code: "MATH 11", title: "Calculus 1", parts: [lecture(3, ["M", "W"], "08:00", "09:30", "ENG 101")] },
    { code: "CHEM 11", title: "Chemistry for Engineers", parts: [lecture(3, ["T", "Th"], "08:00", "09:30", "ENG 102"), laboratory(1, ["F"], "08:00", "11:00", "CHEM LAB")] },
    { code: "EE 1", title: "Engineering Drawing", parts: [laboratory(1, ["Sa"], "08:00", "11:00", "DRAFT 1")] },
    { code: "GE 1", title: "Understanding the Self", parts: [lecture(3, ["M", "W"], "10:00", "11:30", "CAS 110")] },
    { code: "GE 4", title: "Mathematics in the Modern World", parts: [lecture(3, ["T", "Th"], "10:00", "11:30", "CAS 112")] },
    { code: "PE 1", title: "Movement Competency Training", parts: [lecture(2, ["F"], "13:00", "15:00", "GYM")] },
  ],
  2: [
    { code: "EE 3", title: "Electrical Circuits 1", parts: [lecture(3, ["M", "W"], "08:00", "09:30", "ENG 201"), laboratory(1, ["F"], "08:00", "11:00", "EELab1")] },
    { code: "EE 4", title: "Electromagnetics", parts: [lecture(2, ["T", "Th"], "08:00", "09:00", "ENG 202")] },
    { code: "MATH 21", title: "Differential Equations", parts: [lecture(3, ["T", "Th"], "10:00", "11:30", "ENG 203")] },
    { code: "ES 21", title: "Engineering Mechanics", parts: [lecture(3, ["M", "W"], "13:00", "14:30", "ENG 204")] },
    { code: "GE 5", title: "Purposive Communication", parts: [lecture(3, ["T", "Th"], "13:00", "14:30", "CAS 114")] },
    { code: "PE 3", title: "Individual and Dual Sports", parts: [lecture(2, ["F"], "13:00", "15:00", "GYM")] },
  ],
  3: [
    { code: "EE 7", title: "Electrical Machines 1", parts: [lecture(3, ["M", "W"], "08:00", "09:30", "ENG 301"), laboratory(1, ["F"], "08:00", "11:00", "EELab2")] },
    { code: "EE 8", title: "Power System Analysis", parts: [lecture(3, ["T", "Th"], "08:00", "09:30", "ENG 302"), laboratory(1, ["Sa"], "08:00", "11:00", "TBA")] },
    { code: "EE 9", title: "Electronic Circuits", parts: [lecture(2, ["M", "W"], "13:00", "14:00", "ENG 303"), laboratory(1, ["F"], "13:00", "16:00", "EELab1")] },
    { code: "EE 10", title: "Feedback Control Systems", parts: [lecture(3, ["T", "Th"], "10:00", "11:30", "ENG 304")] },
    { code: "GE 8", title: "Ethics", parts: [lecture(3, ["T", "Th"], "14:30", "16:00", "CAS 112")] },
    { code: "GE 9", title: "Life and Works of Rizal", parts: [lecture(3, ["M", "W"], "15:00", "16:30", "CAS 110")] },
    { code: "ES 31", title: "Engineering Economics", parts: [lecture(3, ["W"], "09:30", "12:30", "ENG 305")] },
  ],
  4: [
    { code: "EE 12", title: "Electrical Standards & Practice", parts: [laboratory(1, ["M"], "08:00", "11:00", "EELab1")] },
    {
      code: "EE 13",
      title: "Electrical Systems & Illumination Engineering Design",
      parts: [
        { classType: "lecture", units: 3, meetings: [{ days: ["M", "T"], startTime: "17:00", endTime: "20:00", room: "TBA-03" }] },
        { classType: "laboratory", units: 2, meetings: [{ days: ["W"], startTime: "17:00", endTime: "20:00", room: "TBA-04" }] },
      ],
    },
    { code: "EE 14", title: "EE Elective 2: Renewable Energy for Sustainable Development", parts: [lecture(2, ["W"], "15:00", "17:00", "FIELD 01"), laboratory(1, ["W"], "07:00", "10:00", "FIELD 01")] },
    { code: "EE 16", title: "Instrumentation & Control", parts: [lecture(2, ["F"], "13:00", "15:00", "TBA-04"), laboratory(1, ["F"], "15:00", "18:00", "TBA-04")] },
    { code: "EE 21", title: "Research Project or Capstone Design Project", parts: [laboratory(1, ["Th"], "13:00", "16:00", "Comp-Lab.")] },
    { code: "GE 4A", title: "Management of Engineering Projects", parts: [lecture(2, ["T"], "13:00", "15:00", "Comp-Lab.")] },
    { code: "GE 6A", title: "Materials Science & Engineering", parts: [lecture(2, ["M", "W"], "13:00", "14:00", "Comp-Lab.")] },
    { code: "GE 7A", title: "Environmental Science & Engineering", parts: [lecture(2, ["W"], "10:00", "12:00", "TBA-03")] },
    { code: "GE 9", title: "Enhancement of Engineering Mathematics", parts: [laboratory(2, ["Th"], "09:00", "12:00", "TBA-03")] },
  ],
};

const romanYear: Record<EnrollmentYearLevel, string> = { 1: "I", 2: "II", 3: "III", 4: "IV" };

function chosenSubjects(yearLevel: EnrollmentYearLevel, block: string, count?: number): EnrollmentSubject[] {
  return subjectsByYear[yearLevel]
    .slice(0, count)
    .map((subject) => ({ ...subject, section: `BSEE ${romanYear[yearLevel]}-${block}` }));
}

interface StudentSeed {
  number: string;
  name: string;
  program: "BSEE";
  year: EnrollmentYearLevel;
  status: EnrollmentStatus;
  submittedAt?: string;
  block?: string;
  count?: number;
  returnMessage?: string;
  returnedAt?: string;
}

function enrollment(termId: string, seed: StudentSeed): StudentEnrollment {
  const submitted = seed.status !== "not-submitted";
  return {
    id: `${termId}-${seed.number}`,
    termId,
    student: { studentNumber: seed.number, name: seed.name, program: seed.program, yearLevel: seed.year },
    status: seed.status,
    submittedAt: submitted ? seed.submittedAt ?? null : null,
    subjects: submitted ? chosenSubjects(seed.year, seed.block ?? "A", seed.count) : [],
    lastReturn: seed.returnMessage && seed.returnedAt ? { message: seed.returnMessage, returnedAt: seed.returnedAt } : null,
  };
}

const currentTermSeeds: readonly StudentSeed[] = [
  { number: "2025-10328", name: "Camille Dela Cruz", program: "BSEE", year: 1, status: "not-submitted" },
  { number: "2024-10217", name: "Alyssa Marie Tan", program: "BSEE", year: 2, status: "pending-review", submittedAt: "2025-07-28T09:18" },
  { number: "2023-10991", name: "Priya Nair", program: "BSEE", year: 3, status: "returned", submittedAt: "2025-07-27T16:31", returnMessage: "EE 8 lab clashes with your NSTP schedule. Please choose BSEE III-B for EE 8 and resubmit.", returnedAt: "2025-07-28T10:05" },
  { number: "2023-11172", name: "Nina Isabel Flores", program: "BSEE", year: 3, status: "pending-review", submittedAt: "2025-07-27T14:12" },
  { number: "2023-10482", name: "Jordan Miguel Reyes", program: "BSEE", year: 3, status: "approved", submittedAt: "2025-07-28T09:42", block: "B" },
  { number: "2022-11804", name: "Miguel Santos", program: "BSEE", year: 4, status: "approved", submittedAt: "2025-07-28T08:56" },
  { number: "2024-10633", name: "Leo Gabriel Garcia", program: "BSEE", year: 2, status: "enrolled", submittedAt: "2025-07-27T15:48" },
  { number: "2025-10412", name: "Bea Lorraine Mendoza", program: "BSEE", year: 1, status: "pending-review", submittedAt: "2025-07-29T08:02", count: 4 },
  { number: "2025-10433", name: "Carlo Antonio Lim", program: "BSEE", year: 1, status: "pending-review", submittedAt: "2025-07-26T11:47" },
  { number: "2024-10255", name: "Danica Joy Ramos", program: "BSEE", year: 2, status: "approved", submittedAt: "2025-07-26T13:20", block: "B" },
  { number: "2024-10276", name: "Enrico Paolo Villanueva", program: "BSEE", year: 2, status: "not-submitted" },
  { number: "2024-10291", name: "Frances Anne Bautista", program: "BSEE", year: 2, status: "pending-review", submittedAt: "2025-07-28T13:36", count: 5 },
  { number: "2023-10507", name: "Gabriel Luis Navarro", program: "BSEE", year: 3, status: "enrolled", submittedAt: "2025-07-25T10:14" },
  { number: "2023-10518", name: "Hannah Grace Castillo", program: "BSEE", year: 3, status: "returned", submittedAt: "2025-07-26T09:51", block: "B", returnMessage: "You are missing ES 31, a required 3rd-year subject. Add it and resubmit.", returnedAt: "2025-07-27T08:30", count: 6 },
  { number: "2023-10539", name: "Ivan Rafael Soriano", program: "BSEE", year: 3, status: "pending-review", submittedAt: "2025-07-29T10:25" },
  { number: "2023-10544", name: "Jasmine Rose Aquino", program: "BSEE", year: 3, status: "not-submitted" },
  { number: "2022-11815", name: "Kevin James Domingo", program: "BSEE", year: 4, status: "pending-review", submittedAt: "2025-07-27T08:40" },
  { number: "2022-11823", name: "Louise Andrea Pascual", program: "BSEE", year: 4, status: "enrolled", submittedAt: "2025-07-25T14:05" },
  { number: "2022-11836", name: "Marco Angelo Torres", program: "BSEE", year: 4, status: "approved", submittedAt: "2025-07-27T10:58", block: "B" },
  { number: "2022-11847", name: "Nicole Therese Rivera", program: "BSEE", year: 4, status: "not-submitted" },
  { number: "2024-10302", name: "Oscar Benedict Cruz", program: "BSEE", year: 2, status: "enrolled", submittedAt: "2025-07-25T09:33" },
  { number: "2025-10458", name: "Patricia Mae Gonzales", program: "BSEE", year: 1, status: "approved", submittedAt: "2025-07-27T12:19", block: "B" },
  { number: "2023-10561", name: "Rafael Martin Ocampo", program: "BSEE", year: 3, status: "pending-review", submittedAt: "2025-07-28T15:07", block: "B" },
];

const previousTermSeeds: readonly StudentSeed[] = [
  { number: "2023-10482", name: "Jordan Miguel Reyes", program: "BSEE", year: 2, status: "enrolled", submittedAt: "2025-01-06T09:10" },
  { number: "2023-11172", name: "Nina Isabel Flores", program: "BSEE", year: 2, status: "enrolled", submittedAt: "2025-01-06T10:22" },
  { number: "2022-11804", name: "Miguel Santos", program: "BSEE", year: 3, status: "enrolled", submittedAt: "2025-01-07T08:45" },
];

export const enrollmentManagementPreview = {
  department: "Electrical Engineering",
  terms,
  enrollments: [
    ...currentTermSeeds.map((seed) => enrollment("2025-2026-first", seed)),
    ...previousTermSeeds.map((seed) => enrollment("2024-2025-second", seed)),
  ],
} satisfies EnrollmentManagementData;
