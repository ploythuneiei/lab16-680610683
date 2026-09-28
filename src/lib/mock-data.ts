import type { Student, Course } from "@/lib/types";

export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
    status: "Active",
    enrolledCourses: [],
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    status: "Active",
    enrolledCourses: ["CS101", "CS201"],
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    status: "Active",
    enrolledCourses: ["ISNE101"],
  },
  {
    studentId: "650610004",
    firstName: "Florence",
    lastName: "Pugh",
    program: "CPE",
    status: "Active",
    enrolledCourses: ["CPE301"],
  },
  {
    studentId: "650610005",
    firstName: "Robert",
    lastName: "Downey",
    program: "CPE",
    status: "Inactive",
    enrolledCourses: [],
  },
  {
    studentId: "650610006",
    firstName: "Zendaya",
    lastName: "Coleman",
    program: "ISNE",
    status: "Active",
    enrolledCourses: ["CS101", "CPE301", "CPE302"],
  },
];

export const courses: Course[] = [
  {
    courseCode: "CS101",
    courseTitle: "Introduction to Programming",
    instructors: ["Dome"],
  },
  {
    courseCode: "CS201",
    courseTitle: "Data Structures",
    instructors: ["Chanadda"],
  },
  {
    courseCode: "CPE301",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseCode: "CPE302",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseCode: "ISNE101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];