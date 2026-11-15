import type {
  EvaluationInstructor,
  EvaluationInstructorResult,
  FacultyEvaluationData,
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

// Independent sample snapshots for each term; these never use live submissions.
// Chair and dean scores are synthetic fixtures, not institutional records.
function historicalInstructorResults(
  scores: readonly (readonly [responses: number, student: number, chair: number, dean: number])[],
): EvaluationInstructorResult[] {
  return previewInstructors.map((instructor, index) => ({
    instructor: { ...instructor },
    responseCount: scores[index][0],
    studentScore: scores[index][1],
    departmentChairScore: scores[index][2],
    deanScore: scores[index][3],
  }));
}

// Synthetic UI fixtures, using the supplied design's term and historical totals.
// These are not institutional records, an authenticated faculty assignment,
// or an approved evaluation policy. Replace through the same data contract.
export const facultyEvaluationPreview: FacultyEvaluationData = {
  // No window has been created yet; the dean starts from the empty state.
  window: null,
  academicYears: ["2025–2026", "2026–2027"],
  currentAcademicYear: "2025–2026",
  departments: [
    "Electrical Engineering",
    "Mechanical Engineering",
    "Industrial Engineering",
    "Information Technology",
    "Industrial Technology",
  ],
  submissions: ["navarro", "villanueva"].map((instructorId) => ({
    term: "2026–2027:first",
    instructorId,
    audience: "dean",
    ratings: Object.fromEntries(Array.from({ length: 15 }, (_, index) => [String(index + 1), 4])),
    comments: "",
  })),
  instructors: previewInstructors,
  reports: previewInstructors.map((instructor) => ({
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
  criteria: [
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
  ],
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
      instructorResults: historicalInstructorResults([
        [48, 92.2, 94.6, 93.4],
        [43, 89.75, 91.6, 92.4],
        [46, 91.45, 93.5, 93.1],
        [41, 88.8, 92.4, 90.8],
        [45, 90.6, 92.0, 92.4],
        [44, 87.95, 90.2, 89.4],
      ]),
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
      instructorResults: historicalInstructorResults([
        [45, 91.0, 93.6, 92.4],
        [40, 88.4, 90.8, 91.6],
        [44, 90.2, 92.7, 92.3],
        [39, 87.6, 91.2, 89.6],
        [42, 89.3, 90.8, 91.2],
        [41, 86.7, 89.0, 88.2],
      ]),
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
      instructorResults: historicalInstructorResults([
        [42, 91.4, 93.0, 91.8],
        [38, 88.9, 90.4, 91.2],
        [40, 90.6, 91.9, 91.5],
        [37, 88.0, 90.7, 89.1],
        [41, 89.7, 90.3, 90.7],
        [39, 87.2, 88.5, 87.7],
      ]),
    },
  ],
};
