"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CourseEnrollmentTracker } from "@/components/courses/CourseEnrollmentTracker";
import { initialCourses } from "@/app/hr-head/courses/page";
import { getEnrollmentsByCourse } from "@/lib/enrollmentService";

export default function CourseEnrollmentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;

  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    // 1. Fetch course details
    const savedCourses = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
    const allCourses = [...initialCourses, ...savedCourses];
    const foundCourse = allCourses.find((c) => String(c.id) === String(courseId));

    if (foundCourse) {
      setCourse(foundCourse);
      const enrs = getEnrollmentsByCourse(foundCourse.id);
      setEnrollments(enrs);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Course Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested course could not be located.</p>
        <button
          onClick={() => router.push("/hr-head/courses")}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Calculate total modules in the course if available
  const totalModules = course.timeline?.length || 4;

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden space-y-4 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-0">
      {/* Top Header */}
      <div className="shrink-0 flex items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={`${course.title} — Enrollment & Progress`}
          description={`Track staff enrollment, completions, and progress for ${course.code}.`}
        />
        <button
          onClick={() => router.push("/hr-head/courses")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </button>
      </div>

      {/* Tracker Component */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CourseEnrollmentTracker
          course={course}
          enrollments={enrollments}
          onRefresh={loadData}
          totalModules={totalModules}
        />
      </div>
    </div>
  );
}
