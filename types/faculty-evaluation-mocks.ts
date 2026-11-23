import { evaluationTermKey } from "@/lib/faculty-evaluation";
import { summarizeClassEvaluations, supervisorEvaluationScore } from "@/lib/faculty-evaluation-results";
import type {
  EvaluationClassResult,
  EvaluationCriterion,
  EvaluationInstructor,
  EvaluationInstructorResult,
  EvaluationSemester,
  EvaluationSubmission,
  FacultyEvaluationData,
  FacultyEvaluationReport,
} from "./faculty-evaluation-types";

const previewInstructors: readonly EvaluationInstructor[] = [
  {
    id: "navarro",
    name: "Dr. Gabriel M. Navarro",
    department: "Electrical Engineering",
    rank: "Professor II",
    subject: "EE 12 · Electrical Standards & Practice",
  },
  {
    id: "villanueva",
    name: "Engr. Andrea L. Villanueva",
    department: "Electrical Engineering",
    rank: "Associate Professor III",
    subject: "EE 13 · Electrical Systems & Illumination Engineering Design",
  },
  {
    id: "soriano",
    name: "Dr. Miguel R. Soriano",
    department: "Electrical Engineering",
    rank: "Professor I",
    subject: "EE 14 · Renewable Energy for Sustainable Development",
  },
  {
    id: "ramos",
    name: "Engr. Patricia C. Ramos",
    department: "Electrical Engineering",
    rank: "Assistant Professor IV",
    subject: "EE 16 · Instrumentation & Control",
  },
  {
    id: "castillo",
    name: "Engr. Rafael P. Castillo",
    department: "Electrical Engineering",
    rank: "Associate Professor I",
    subject: "EE 21 · Research Project or Capstone Design Project",
  },
  {
    id: "mendoza",
    name: "Engr. Sofia M. Mendoza",
    department: "Electrical Engineering",
    rank: "Instructor III",
    subject: "GE 4A · Management of Engineering Projects",
  },
];

const evaluationCriteria: readonly EvaluationCriterion[] = [
  {
    id: "1",
    section: "Management of Teaching and Learning",
    statement: "Comes to class on time.",
    verification: "Daily time record · Faculty schedule",
  },
  {
    id: "2",
    section: "Management of Teaching and Learning",
    statement:
      "Explains learning outcomes, expectations, grading system, and course requirements.",
    supervisorStatement: "Submits updated syllabus, grade sheets, and required reports on time.",
    verification: "Submission logs · Acknowledgement emails",
  },
  {
    id: "3",
    section: "Management of Teaching and Learning",
    statement: "Maximizes the allotted time and learning hours effectively.",
    verification: "Class schedules · Timetables · LMS logs",
  },
  {
    id: "4",
    section: "Management of Teaching and Learning",
    statement:
      "Facilitates critical and creative thinking through appropriate learning activities.",
    verification: "Syllabus · Learning plan · Observation",
  },
  {
    id: "5",
    section: "Management of Teaching and Learning",
    statement:
      "Guides students to learn independently, reflect on new ideas, and make decisions.",
    verification: "Student work samples · LMS logs",
  },
  {
    id: "6",
    section: "Management of Teaching and Learning",
    statement: "Communicates constructive feedback to students for their academic growth.",
    verification: "Graded work · Emails · LMS logs",
  },
  {
    id: "7",
    section: "Content Knowledge, Pedagogy and Technology",
    statement: "Demonstrates extensive and broad knowledge of the subject/course.",
    verification: "Syllabus · Learning plan · Instructional materials",
  },
  {
    id: "8",
    section: "Content Knowledge, Pedagogy and Technology",
    statement: "Simplifies complex ideas in the lesson for ease of understanding.",
    verification: "Observation · Lecture notes · LMS logs",
  },
  {
    id: "9",
    section: "Content Knowledge, Pedagogy and Technology",
    statement: "Relates the subject matter to contemporary issues and daily-life applications.",
    verification: "Syllabus · Observation · Learning plan",
  },
  {
    id: "10",
    section: "Content Knowledge, Pedagogy and Technology",
    statement: "Promotes active learning using appropriate resources and ICT tools.",
    verification: "LMS logs · Multimedia · Student work",
  },
  {
    id: "11",
    section: "Content Knowledge, Pedagogy and Technology",
    statement: "Uses appropriate assessments aligned with the learning outcomes.",
    verification: "Assessment tools · Exam samples · Records",
  },
  {
    id: "12",
    section: "Commitment and Transparency",
    statement: "Recognizes and values student diversity and individual differences.",
    verification: "Observation · Learning plans · Advising records",
  },
  {
    id: "13",
    section: "Commitment and Transparency",
    statement: "Assists students with learning challenges during consultation hours.",
    verification: "Consultation logs · Emails · LMS records",
  },
  {
    id: "14",
    section: "Commitment and Transparency",
    statement: "Provides immediate feedback on student outputs and performance.",
    verification: "Graded work · Rubrics · LMS logs",
  },
  {
    id: "15",
    section: "Commitment and Transparency",
    statement: "Provides transparent and clear criteria in rating student performance.",
    verification: "Rubrics · Syllabus · Class records",
  },
];

// Synthetic sample breakdowns for completed terms. They are not institutional
// records or an approved evaluation policy; the archived totals below are
// derived from them so the results page stays internally consistent.
const historicalSectionPrefix: Readonly<Record<string, string>> = {
  navarro: "BSEE IV", villanueva: "BSEE IV", soriano: "BSEE IV",
  ramos: "BSEE III", castillo: "BSEE IV", mendoza: "BSEE III",
};

const historicalStudentComments = [
  "Explains difficult topics clearly and provides useful examples.",
  "More consultation time before major assessments would be helpful.",
  "The online materials and feedback supported independent learning.",
  "Laboratory activities connected the lessons to real industry practice.",
  "Grading criteria were clear from the start of the semester.",
];

const historicalChairComments = [
  "Continue using varied assessment strategies aligned with outcomes.",
  "Strengthen documentation of consultation and feedback schedules.",
  "Sustain the strong use of technology and real-world applications.",
  "Submit grade sheets and course reports closer to the deadline window.",
];

const historicalDeanComments = [
  "Consistently meets instructional and documentation requirements.",
  "Encourage more industry-linked projects in upper-year classes.",
  "Maintain timely submission of syllabi and learning plans.",
];

/** Fifteen benchmark ratings: `fives` items rated 5 and the rest 4, rotated by `offset`. */
function benchmarkRatings(fives: number, offset: number): Record<string, number> {
  return Object.fromEntries(evaluationCriteria.map(({ id }, index) => [
    id,
    (index + offset) % evaluationCriteria.length < fives ? 5 : 4,
  ]));
}

type HistoricalSample = readonly [responses: number, studentScore: number, chairFives: number, deanFives: number];

/**
 * Builds one completed term's sample class breakdowns, Department Chair report,
 * and College Dean submission per instructor, plus the archived totals derived
 * from them. Samples follow `previewInstructors` order.
 */
function historicalTermSamples(academicYear: string, semester: EvaluationSemester, samples: readonly HistoricalSample[]) {
  const term = evaluationTermKey({ academicYear, semester });
  const entries = previewInstructors.map((instructor, index) => {
    const [responses, studentScore, chairFives, deanFives] = samples[index];
    const [code, title] = instructor.subject.split(" · ");
    const sectionA = Math.ceil(responses / 2);
    const sectionB = responses - sectionA;
    const spread = 1.2;
    // Section A rates `spread` above the instructor's SET; section B balances it.
    const classes: EvaluationClassResult[] = [
      { id: `${instructor.id}-a`, code, title, section: `${historicalSectionPrefix[instructor.id]}-A`, responses: sectionA, enrolled: sectionA + 4, totalScore: sectionA * (studentScore + spread) },
      { id: `${instructor.id}-b`, code, title, section: `${historicalSectionPrefix[instructor.id]}-B`, responses: sectionB, enrolled: sectionB + 6, totalScore: sectionB * studentScore - sectionA * spread },
    ];
    const report: FacultyEvaluationReport = {
      instructorId: instructor.id,
      term,
      classes,
      departmentChair: {
        ratings: benchmarkRatings(chairFives, index * 2),
        comments: [historicalChairComments[index % historicalChairComments.length]],
      },
      studentComments: [0, 1, 2].map((step) => historicalStudentComments[(index + step) % historicalStudentComments.length]),
    };
    const deanSubmission: EvaluationSubmission = {
      term,
      instructorId: instructor.id,
      audience: "dean",
      ratings: benchmarkRatings(deanFives, index * 2 + 5),
      comments: historicalDeanComments[index % historicalDeanComments.length],
    };
    const students = summarizeClassEvaluations(classes);
    const result: EvaluationInstructorResult = {
      instructor: { ...instructor },
      responseCount: students.responses,
      studentScore: students.studentScore,
      departmentChairScore: supervisorEvaluationScore(evaluationCriteria, report.departmentChair),
      deanScore: supervisorEvaluationScore(evaluationCriteria, { ratings: deanSubmission.ratings, comments: [] }),
    };
    return { report, deanSubmission, result };
  });

  return {
    instructorResults: entries.map((entry) => entry.result),
    reports: entries.map((entry) => entry.report),
    submissions: entries.map((entry) => entry.deanSubmission),
  };
}

const term2024Second = historicalTermSamples("2024–2025", "second", [
  [48, 92.2, 11, 10], [43, 89.75, 9, 9], [46, 91.45, 10, 10],
  [41, 88.8, 9, 8], [45, 90.6, 9, 9], [44, 87.95, 8, 7],
]);
const term2024First = historicalTermSamples("2024–2025", "first", [
  [45, 91.0, 10, 9], [40, 88.4, 8, 8], [44, 90.2, 9, 9],
  [39, 87.6, 8, 7], [42, 89.3, 8, 8], [41, 86.7, 7, 6],
]);
const term2023Second = historicalTermSamples("2023–2024", "second", [
  [42, 91.4, 10, 9], [38, 88.9, 8, 8], [40, 90.6, 9, 9],
  [37, 88.0, 8, 7], [41, 89.7, 8, 8], [39, 87.2, 6, 6],
]);
const historicalTerms = [term2024Second, term2024First, term2023Second];

// Synthetic UI fixtures, using the supplied design's term and historical totals.
// These are not institutional records, an authenticated faculty assignment,
// or an approved evaluation policy. Replace through the same data contract.
export const facultyEvaluationPreview: FacultyEvaluationData = {
  // Preview window for the term the sample submissions and reports use, so the
  // chair and dean rosters can be evaluated. Set to null to preview the dean's
  // "no window yet" empty state. After closesAt passes, the window shows as Closed.
  window: {
    academicYear: "2026–2027",
    semester: "first",
    opensAt: "2026-08-01T08:00",
    closesAt: "2027-01-31T17:00",
    manuallyClosed: false,
  },
  academicYears: ["2025–2026", "2026–2027"],
  currentAcademicYear: "2025–2026",
  departments: [
    "Electrical Engineering",
    "Mechanical Engineering",
    "Industrial Engineering",
    "Information Technology",
    "Industrial Technology",
  ],
  submissions: [
    ...["navarro", "villanueva"].map((instructorId): EvaluationSubmission => ({
      term: "2026–2027:first",
      instructorId,
      audience: "dean",
      ratings: Object.fromEntries(Array.from({ length: 15 }, (_, index) => [String(index + 1), 4])),
      comments: "",
    })),
    // Completed terms' College Dean evaluations, shown on historical results.
    ...historicalTerms.flatMap((term) => term.submissions),
  ],
  instructors: previewInstructors,
  reports: [
    ...previewInstructors.map((instructor) => ({
      instructorId: instructor.id,
      term: "2026–2027:first",
      classes: [
        { id: "ee12", code: "EE 12", title: "Electrical Standards & Practice", section: "BSEE IV-A", responses: 25, enrolled: 30, totalScore: 2175 },
        { id: "ee13", code: "EE 13", title: "Electrical Systems & Illumination Engineering Design", section: "BSEE IV-A", responses: 60, enrolled: 80, totalScore: 5560 },
        { id: "ee14", code: "EE 14", title: "Renewable Energy for Sustainable Development", section: "BSEE IV-B", responses: 8, enrolled: 40, totalScore: 560 },
        { id: "ee16", code: "EE 16", title: "Instrumentation & Control", section: "BSEE III-A", responses: 100, enrolled: 200, totalScore: 9500 },
        { id: "ee21", code: "EE 21", title: "Research Project or Capstone Design Project", section: "BSEE IV-C", responses: 22, enrolled: 150, totalScore: 1563 },
      ],
      departmentChair: {
        ratings: Object.fromEntries(Array.from({ length: 15 }, (_, index) => [String(index + 1), index < 9 ? 5 : 4])),
        comments: [
          "Continue using varied assessment strategies aligned with outcomes.",
          "Strengthen documentation of consultation and feedback schedules.",
          "Sustain the strong use of technology and real-world applications.",
        ],
      },
      studentComments: [
        "Explains difficult topics clearly and provides useful examples.",
        "More consultation time before major assessments would be helpful.",
        "The online materials and feedback supported independent learning.",
      ],
    })),
    ...historicalTerms.flatMap((term) => term.reports),
  ],
  criteria: evaluationCriteria,
  results: [
    {
      id: "2024-2025-second",
      academicYear: "2024–2025",
      semester: "second",
      facultyCount: 28,
      responseCount: 1249,
      studentScore: 90.04,
      departmentChairScore: 92.4,
      deanScore: 91.6,
      instructorResults: term2024Second.instructorResults,
    },
    {
      id: "2024-2025-first",
      academicYear: "2024–2025",
      semester: "first",
      facultyCount: 27,
      responseCount: 1186,
      studentScore: 88.76,
      departmentChairScore: 91.7,
      deanScore: 90.7,
      instructorResults: term2024First.instructorResults,
    },
    {
      id: "2023-2024-second",
      academicYear: "2023–2024",
      semester: "second",
      facultyCount: 26,
      responseCount: 1094,
      studentScore: 89.12,
      departmentChairScore: 90.9,
      deanScore: 90.3,
      instructorResults: term2023Second.instructorResults,
    },
  ],
};

/** Preview fixture: the signed-in chair's department until sessions are implemented. */
export const departmentChairEvaluationPreviewDepartment = "Electrical Engineering";
