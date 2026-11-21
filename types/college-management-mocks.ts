import type { College, Department, DepartmentFacultyMember, DepartmentStudent } from "./college-management-types";

// Illustrative design fixtures only; these are not authorized institutional records.
export const collegeManagementPreview = {
  colleges: [
    { id: "cote", code: "COTE", name: "College of Technology and Engineering", description: "Electrical, Mechanical & Industrial Engineering; Information & Industrial Technology", icon: "cpu" },
    { id: "coed", code: "COED", name: "College of Education", description: "Elementary Education, Secondary Education and Physical Education", icon: "graduation-cap" },
    { id: "cba", code: "CBA", name: "College of Business Administration", description: "Accountancy, Business Management and Entrepreneurship", icon: "briefcase" },
    { id: "cas", code: "CAS", name: "College of Arts and Sciences", description: "Languages, Social Sciences and Natural Sciences", icon: "book-open" },
    { id: "con", code: "CON", name: "College of Nursing", description: "Nursing and Allied Health Sciences", icon: "heart-pulse" },
    { id: "chm", code: "CHM", name: "College of Hospitality Management", description: "Hospitality Management and Tourism Management", icon: "concierge-bell" },
  ] satisfies College[],
  departments: [
    { id: "ee", collegeId: "cote", code: "EE", name: "Electrical Engineering Department", description: "", icon: "zap" },
    { id: "me", collegeId: "cote", code: "ME", name: "Mechanical Engineering Department", description: "", icon: "cog" },
    { id: "ie", collegeId: "cote", code: "IE", name: "Industrial Engineering Department", description: "", icon: "wrench" },
    { id: "it", collegeId: "cote", code: "IT", name: "Information Technology Department", description: "", icon: "monitor" },
    { id: "int", collegeId: "cote", code: "INT", name: "Industrial Technology Department", description: "", icon: "cpu" },
  ] satisfies Department[],
  students: [
    { id: "alyssa", departmentId: "ee", name: "Alyssa Mae Santos", initials: "AS", email: "alyssa.santos@university.edu", studentNumber: "2024-01842", yearStanding: 1, batch: "2020–2024" },
    { id: "john", departmentId: "ee", name: "John Paulo Reyes", initials: "JR", email: "john.reyes@university.edu", studentNumber: "2024-02117", yearStanding: 1, batch: "2020–2024" },
    { id: "maria", departmentId: "ee", name: "Maria Nicole Garcia", initials: "MG", email: "maria.garcia@university.edu", studentNumber: "2024-00963", yearStanding: 1, batch: "2020–2024" },
    { id: "daniel", departmentId: "ee", name: "Daniel Luis Mendoza", initials: "DM", email: "daniel.mendoza@university.edu", studentNumber: "2024-01458", yearStanding: 1, batch: "2020–2024" },
    { id: "beatrice", departmentId: "ee", name: "Beatrice Anne Cruz", initials: "BC", email: "beatrice.cruz@university.edu", studentNumber: "2023-00681", yearStanding: 2, batch: "2020–2024" },
    { id: "mark", departmentId: "ee", name: "Mark Angelo Lim", initials: "ML", email: "mark.lim@university.edu", studentNumber: "2023-01209", yearStanding: 2, batch: "2020–2024" },
    { id: "sophia", departmentId: "ee", name: "Sophia Isabel Flores", initials: "SF", email: "sophia.flores@university.edu", studentNumber: "2023-01954", yearStanding: 2, batch: "2020–2024" },
  ] satisfies DepartmentStudent[],
  faculty: [
    { id: "navarro", departmentId: "ee", name: "Dr. Gabriel M. Navarro", initials: "GN", academicRank: "Professor II" },
    { id: "villanueva", departmentId: "ee", name: "Engr. Andrea L. Villanueva", initials: "AV", academicRank: "Associate Professor III" },
    { id: "soriano", departmentId: "ee", name: "Dr. Miguel R. Soriano", initials: "MS", academicRank: "Professor I" },
    { id: "ramos", departmentId: "ee", name: "Engr. Patricia C. Ramos", initials: "PR", academicRank: "Assistant Professor IV" },
    { id: "castillo", departmentId: "ee", name: "Engr. Rafael P. Castillo", initials: "RC", academicRank: "Associate Professor I" },
    { id: "mendoza", departmentId: "ee", name: "Engr. Sofia M. Mendoza", initials: "SM", academicRank: "Instructor III" },
  ] satisfies DepartmentFacultyMember[],
};
