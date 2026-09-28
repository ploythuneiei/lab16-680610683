interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  program: "CPE" | "ISNE";
  status: "Active" | "Inactive";
  enrolledCourses: string[]; // รหัสวิชาที่ลงทะเบียน เช่น ["CS101", "CS201"]
}
export type { Student };

// วิชาที่เปิดสอน — เพิ่มใหม่ได้จากหน้า "จัดการวิชาเรียน" (/admin/courses)
interface Course {
  courseCode: string; // เช่น "CPE301" — ค่านี้คือค่าเดียวกับที่ไปอยู่ใน Student.enrolledCourses
  courseTitle: string;
  instructors?: string[]; // ผู้สอนมีได้มากกว่า 1 คน
}
export type { Course };

interface User {
  username: string;
  password: string;
  studentId?: string | null;
  role: "STUDENT" | "ADMIN";
  tokens?: string[];
}
export type { User };
