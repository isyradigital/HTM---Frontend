"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";
import { initialCourses } from "@/app/hr-head/courses/page";

export default function UserCoursesPage() {
    const [courses, setCourses] = useState(initialCourses);
    const [searchQuery, setSearchQuery] = useState("");

    // Load published courses from localStorage and merge with initial
    useEffect(() => {
        const loadCourses = () => {
            const saved = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
            const deletedDemo = JSON.parse(localStorage.getItem("deleted_demo_courses") || "[]");

            const filteredInitial = initialCourses.filter(c => !deletedDemo.includes(c.id));
            const allCourses = [...filteredInitial, ...saved];
            
            // For standard user, we should only show Active/Published courses
            // But we will show all that are not Draft for safety
            const activeCourses = allCourses.filter(c => c.status !== "Draft");
            setCourses(activeCourses);
        };
        
        loadCourses();
        // Also update when another tab publishes a course
        window.addEventListener("storage", loadCourses);
        return () => window.removeEventListener("storage", loadCourses);
    }, []);

    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-y-auto space-y-6 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm themed-scroll">
            <div className="flex items-start sm:items-center justify-between gap-4">
                <PageHeader
                    title="Training Courses"
                    description="Explore and assign yourself to specialized training modules."
                />

                {/* Simple search input on the top right for convenience */}
                <div className="hidden md:block relative w-64 mt-2">
                    <input
                        type="text"
                        placeholder="Search programs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                    />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {filteredCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        colorScheme={course.colorScheme}
                        hrefPrefix="/user/courses"
                    />
                ))}
                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 font-semibold">
                        No active courses available right now.
                    </div>
                )}
            </div>
        </div>
    );
}
