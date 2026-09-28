import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  // ---- วิชา (ใช้ในหน้า /admin/courses) ----
  /** เพิ่มวิชาใหม่ */
  addCourse: (course: Course) => void;
  /** ลบวิชา พร้อม cascade ลบออกจาก enrolledCourses ของนักศึกษาทุกคนที่ลงไว้ */
  removeCourse: (courseCode: string) => void;
  /** ลบผู้สอนคนหนึ่งออกจากวิชา */
  removeInstructor: (courseCode: string, instructorName: string) => void;

  // ---- การลงทะเบียน (ใช้ในหน้า /admin/enrollments) ----
  /** ลงทะเบียนนักศึกษาหลายคนให้วิชาเดียวกันพร้อมกัน (ข้ามคนที่ลงอยู่แล้ว) */
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  /** ถอนนักศึกษาคนหนึ่งออกจากวิชา */
  unenrollStudent: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter(
              (code) => code !== courseCode
            ),
          })),
        })),

      removeInstructor: (courseCode, instructorName) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                ...c,
                instructors: (c.instructors ?? []).filter(
                  (name) => name !== instructorName
                ),
              }
              : c
          ),
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.studentId) &&
              !s.enrolledCourses.includes(courseCode)
              ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
              : s
          ),
        })),

      unenrollStudent: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                ...s,
                enrolledCourses: s.enrolledCourses.filter(
                  (code) => code !== courseCode
                ),
              }
              : s
          ),
        })),
    }),
    {
      // ⚠️ เปลี่ยน "680610683" ตรงนี้เป็นรหัสนักศึกษาของตัวเอง ตามรูปแบบ lab16-2569-รหัสนศ.
      name: "lab16-2569-680610683",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    }
  )
);