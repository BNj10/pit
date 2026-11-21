import type { InstructorEvaluationData, InstructorEvaluationQuestionnaire } from "./instructor-evaluation-types";

// Questionnaire copied from design node p4Hxf; this is a UI fixture, not institutional policy.
export const instructorEvaluationQuestionnaire: InstructorEvaluationQuestionnaire = {
  scales: [
    { value: 5, label: "Outstanding", frequency: "Always manifested", definition: "Evident in nearly all relevant situations (91–100%)." },
    { value: 4, label: "Very Good", frequency: "Often manifested", definition: "Evident most of the time, with occasional lapses (61–90%)." },
    { value: 3, label: "Good", frequency: "Sometimes manifested", definition: "Evident about half the time (31–60%)." },
    { value: 2, label: "Fair", frequency: "Seldom manifested", definition: "Infrequently demonstrated in relevant situations (11–30%)." },
    { value: 1, label: "Needs Improvement", frequency: "Never / Rarely manifested", definition: "Almost never evident, with only isolated cases (0–10%)." },
  ],
  groups: [
    {
      id: "management",
      title: "A. Management of Teaching and Learning",
      description: "Intentional and organized handling of classroom presence, academic expectations, efficient use of time, and student-centered learning activities that promote critical thinking and continuous feedback.",
      questions: [
        { id: "q1", number: 1, statement: "Comes to class on time." },
        { id: "q2", number: 2, statement: "Explains learning outcomes, expectations, grading system, and course requirements." },
        { id: "q3", number: 3, statement: "Maximizes the allotted time and learning hours effectively." },
        { id: "q4", number: 4, statement: "Facilitates critical and creative thinking through appropriate learning activities." },
        { id: "q5", number: 5, statement: "Guides students to learn on their own, reflect on new ideas and experiences, and make decisions in accomplishing given tasks." },
        { id: "q6", number: 6, statement: "Communicates constructive feedback to students for their academic growth." },
      ],
    },
    {
      id: "knowledge",
      title: "B. Content Knowledge, Pedagogy and Technology",
      description: "Demonstrates strong subject mastery, presents complex concepts clearly, connects learning to real-world contexts, and uses appropriate instructional strategies and digital tools.",
      questions: [
        { id: "q7", number: 7, statement: "Demonstrates extensive and broad knowledge of the subject/course." },
        { id: "q8", number: 8, statement: "Simplifies complex ideas in the lesson for ease of understanding." },
        { id: "q9", number: 9, statement: "Relates the subject matter to contemporary issues and developments in the discipline and/or daily life activities." },
        { id: "q10", number: 10, statement: "Promotes active learning and student engagement by using appropriate teaching and learning resources including ICT tools and platforms." },
        { id: "q11", number: 11, statement: "Uses appropriate assessments aligned with the learning outcomes." },
      ],
    },
    {
      id: "commitment",
      title: "C. Commitment and Transparency",
      description: "Shows consistent dedication to student learning through timely support and feedback, fairness, accountability, and clear communication of performance criteria.",
      questions: [
        { id: "q12", number: 12, statement: "Recognizes and values the unique diversity and individual differences among students." },
        { id: "q13", number: 13, statement: "Assists students with their learning challenges during consultation hours." },
        { id: "q14", number: 14, statement: "Provides immediate feedback on student outputs and performance." },
        { id: "q15", number: 15, statement: "Provides transparent and clear criteria in rating students’ performance." },
      ],
    },
  ],
};

// Design preview fixtures. Submission state is not connected to an evaluation API.
export const instructorEvaluationPreview: InstructorEvaluationData = {
  context: { programLevel: "BSIT · Third Year", term: "1st Semester · 2025–2026" },
  questionnaire: instructorEvaluationQuestionnaire,
  subjects: [
    { id: "preview-evaluation-001", code: "IT 321", title: "Web Systems and Technologies", instructor: "Prof. Maria L. Santos", section: "BSIT 3A", department: "College of Information Technology", evaluationStatus: "pending" },
    { id: "preview-evaluation-002", code: "IT 322", title: "Information Assurance and Security", instructor: "Engr. Carlo D. Reyes", section: "BSIT 3A", department: null, evaluationStatus: "pending" },
    { id: "preview-evaluation-003", code: "CS 315", title: "Human–Computer Interaction", instructor: "Dr. Ana P. Cruz", section: "BSIT 3A", department: null, evaluationStatus: "pending" },
    { id: "preview-evaluation-004", code: "GE 106", title: "Ethics", instructor: "Prof. Liza M. Mendoza", section: "BSIT 3A", department: null, evaluationStatus: "pending" },
    { id: "preview-evaluation-005", code: "IT 323", title: "Systems Integration and Architecture", instructor: "Engr. Paolo R. Lim", section: "BSIT 3A", department: null, evaluationStatus: "submitted" },
    { id: "preview-evaluation-006", code: "PE 4", title: "Team Sports", instructor: "Coach Rafael B. Diaz", section: "BSIT 3A", department: null, evaluationStatus: "pending" },
  ],
};
