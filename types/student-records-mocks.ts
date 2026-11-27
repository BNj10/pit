import type { StudentRecordsData, StudentRecordStudent } from "./student-records-types";

// Synthetic preview students. The first seven rows follow the supplied reference;
// the remaining fixtures make search, filters, and pagination work on real rows.
const referenceStudents: readonly StudentRecordStudent[] = [
  { studentNumber: "2024-01842", name: "Alyssa Mae Santos", initials: "AS", email: "alyssa.santos@university.edu", yearStanding: "1st Year", batch: "2020–2024" },
  { studentNumber: "2024-02117", name: "John Paulo Reyes", initials: "JR", email: "john.reyes@university.edu", yearStanding: "1st Year", batch: "2020–2024" },
  { studentNumber: "2024-00963", name: "Maria Nicole Garcia", initials: "MG", email: "maria.garcia@university.edu", yearStanding: "1st Year", batch: "2020–2024" },
  { studentNumber: "2024-01458", name: "Daniel Luis Mendoza", initials: "DM", email: "daniel.mendoza@university.edu", yearStanding: "1st Year", batch: "2020–2024" },
  { studentNumber: "2023-00681", name: "Beatrice Anne Cruz", initials: "BC", email: "beatrice.cruz@university.edu", yearStanding: "2nd Year", batch: "2020–2024" },
  { studentNumber: "2023-01209", name: "Mark Angelo Lim", initials: "ML", email: "mark.lim@university.edu", yearStanding: "2nd Year", batch: "2020–2024" },
  { studentNumber: "2023-01954", name: "Sophia Isabel Flores", initials: "SF", email: "sophia.flores@university.edu", yearStanding: "2nd Year", batch: "2020–2024" },
];

const firstNames = ["Adrian", "Andrea", "Carlo", "Camille", "Gabriel", "Isabel", "Joshua", "Julia", "Miguel", "Patricia", "Rafael", "Sofia"];
const lastNames = ["Aguilar", "Bautista", "Castillo", "Dela Cruz", "Domingo", "Fernandez", "Gonzales", "Hernandez", "Lopez", "Navarro", "Pascual", "Ramos", "Rivera", "Rosario", "Salazar", "Soriano", "Torres", "Valdez", "Vargas", "Villanueva"];
const yearStandings = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const batches = ["2020–2024", "2021–2025", "2022–2026"];

const additionalStudents: StudentRecordStudent[] = Array.from({ length: 237 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length)];
  const yearIndex = index % yearStandings.length;

  return {
    studentNumber: `${2024 - yearIndex}-${String(30000 + index).padStart(5, "0")}`,
    name: `${firstName} ${lastName}`,
    initials: `${firstName[0]}${lastName[0]}`,
    email: `${firstName}.${lastName.replaceAll(" ", "")}.${index + 1}@university.edu`.toLowerCase(),
    yearStanding: yearStandings[yearIndex],
    batch: batches[index % batches.length],
  };
});

// Invited students who haven't finished account setup; the first invitation has expired.
const invitedStudents: readonly StudentRecordStudent[] = [
  { studentNumber: "26-0001-042", name: "Paolo Miguel Ramos", initials: "PR", email: "paolo.ramos@university.edu", yearStanding: "1st Year", batch: "2026–2030", invitation: { sentAt: "2026-11-20T09:00:00+08:00" } },
];

export const studentRecordsPreview: StudentRecordsData = {
  department: "Computer Science Department",
  pageSize: 7,
  students: [...invitedStudents, ...referenceStudents, ...additionalStudents],
};
