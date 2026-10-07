"use client";

// Re-using the exact same CourseViewPage from hr-head to maintain 
// component-based architecture and avoid code duplication.
import CourseViewPage from "@/app/hr-head/courses/[id]/page";

export default function UserCourseView() {
    return <CourseViewPage />;
}
