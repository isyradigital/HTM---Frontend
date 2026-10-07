"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CourseCard } from "@/components/courses/CourseCard";

export const initialCourses = [
    { id: 1, title: "Junior Medical Programs", code: "MED-101", status: "Active", colorScheme: "blue", description: "For junior residents. Focus on fundamentals and core medical practices." },
    { id: 2, title: "Advanced Surgical Programs", code: "SUR-201", status: "Active", colorScheme: "teal", description: "For senior surgeons. Advanced techniques and competitive surgical procedures." },
    { id: 3, title: "Adult Care Programs", code: "NUR-100", status: "Draft", colorScheme: "emerald", description: "For nurses of all levels. From beginner to advanced patient care." },
    { id: 4, title: "Emergency Protocols", code: "ER-500", status: "Active", colorScheme: "indigo", description: "Critical response and life support for ER teams." },
];

export default function CoursesPage() {
    const [courses, setCourses] = useState(initialCourses);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Load published courses from localStorage and merge with initial
    useEffect(() => {
        const loadCourses = () => {
            const saved = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
            const deletedDemo = JSON.parse(localStorage.getItem("deleted_demo_courses") || "[]");

            const filteredInitial = initialCourses.filter(c => !deletedDemo.includes(c.id));
            setCourses([...filteredInitial, ...saved]);
        };
        loadCourses();
        // Also update when another tab publishes a course
        window.addEventListener("storage", loadCourses);
        return () => window.removeEventListener("storage", loadCourses);
    }, []);

    const handleEditCourse = (course) => {
        router.push(`/hr-head/courses/create?edit=${course.id}`);
    };

    const handleDeleteCourse = (courseToDelete) => {
        if (confirm(`Are you sure you want to delete "${courseToDelete.title}"?`)) {
            // 1. Remove from localStorage created courses
            const saved = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
            const updatedSaved = saved.filter(c => String(c.id) !== String(courseToDelete.id));
            localStorage.setItem("hospital_courses", JSON.stringify(updatedSaved));

            // 2. Track deleted demo courses so they don't reappear
            if (initialCourses.some(c => String(c.id) === String(courseToDelete.id))) {
                const deletedDemo = JSON.parse(localStorage.getItem("deleted_demo_courses") || "[]");
                deletedDemo.push(courseToDelete.id);
                localStorage.setItem("deleted_demo_courses", JSON.stringify(deletedDemo));
            }

            // Update state
            setCourses(prev => prev.filter(c => String(c.id) !== String(courseToDelete.id)));
        }
    };

    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-y-auto space-y-6 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm themed-scroll">
            <div className="flex items-start sm:items-center justify-between gap-4">
                <PageHeader
                    title="Comprehensive Medical Training"
                    description="Explore our specialized training modules tailored for all hospital staff levels."
                    actionText="Create Course"
                    ActionIcon={Plus}
                    onActionClick={() => router.push("/hr-head/courses/create")}
                />

                {/* Simple search input on the top right for convenience */}
                <div className="hidden md:block relative w-64">
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
                        onEdit={handleEditCourse}
                        onDelete={handleDeleteCourse}
                    />
                ))}
                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 font-semibold">
                        No programs found.
                    </div>
                )}
            </div>
        </div>
    );
}
