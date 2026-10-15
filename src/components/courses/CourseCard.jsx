import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Edit2, Trash2, Users } from "lucide-react";

export function CourseCard({
  course,
  colorScheme,
  onEdit,
  onDelete,
  hrefPrefix = "/hr-head/courses",
}) {
  const colors = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      hoverBg: "hover:bg-blue-600 dark:hover:bg-blue-500",
      text: "text-slate-900 dark:text-white group-hover:text-white transition-colors",
      desc: "text-slate-600 dark:text-slate-400 group-hover:text-blue-50 dark:group-hover:text-blue-50 transition-colors",
      tagBg: "bg-white dark:bg-slate-800 group-hover:bg-blue-700 dark:group-hover:bg-blue-700 transition-colors",
      tagText: "text-blue-600 dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors",
    },
    teal: {
      bg: "bg-teal-100 dark:bg-teal-900/30",
      hoverBg: "hover:bg-teal-600 dark:hover:bg-teal-500",
      text: "text-slate-900 dark:text-white group-hover:text-white transition-colors",
      desc: "text-slate-600 dark:text-slate-400 group-hover:text-teal-50 dark:group-hover:text-teal-50 transition-colors",
      tagBg: "bg-white dark:bg-slate-800 group-hover:bg-teal-700 dark:group-hover:bg-teal-700 transition-colors",
      tagText: "text-teal-600 dark:text-teal-400 group-hover:text-white dark:group-hover:text-white transition-colors",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      hoverBg: "hover:bg-emerald-600 dark:hover:bg-emerald-500",
      text: "text-slate-900 dark:text-white group-hover:text-white transition-colors",
      desc: "text-slate-600 dark:text-slate-400 group-hover:text-emerald-50 dark:group-hover:text-emerald-50 transition-colors",
      tagBg: "bg-white dark:bg-slate-800 group-hover:bg-emerald-700 dark:group-hover:bg-emerald-700 transition-colors",
      tagText: "text-emerald-600 dark:text-emerald-400 group-hover:text-white dark:group-hover:text-white transition-colors",
    },
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      hoverBg: "hover:bg-indigo-600 dark:hover:bg-indigo-500",
      text: "text-slate-900 dark:text-white group-hover:text-white transition-colors",
      desc: "text-slate-600 dark:text-slate-400 group-hover:text-indigo-50 dark:group-hover:text-indigo-50 transition-colors",
      tagBg: "bg-white dark:bg-slate-800 group-hover:bg-indigo-700 dark:group-hover:bg-indigo-700 transition-colors",
      tagText: "text-indigo-600 dark:text-indigo-400 group-hover:text-white dark:group-hover:text-white transition-colors",
    },
  };

  const theme = colors[colorScheme] || colors.blue;

  // Placeholder images based on course index/id to make it look like the design
  const images = [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800", // Medical student
    "https://images.unsplash.com/photo-1551076805-e18690c5e422?auto=format&fit=crop&q=80&w=800", // CPR
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800", // Ethics
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800", // Doctor
  ];
  const imageSrc = course.image || images[course.id % images.length];
  const router = useRouter();

  const isHrHead = hrefPrefix.includes("hr-head");

  return (
    <div
      onClick={() => router.push(`${hrefPrefix}/${course.id}`)}
      className={`relative group flex flex-col w-full h-[470px] rounded-[32px] ${theme.bg} ${theme.hoverBg} p-2 transition-all duration-300 hover:scale-[1.02] shadow-sm cursor-pointer`}
    >
      {/* Top Content Area */}
      <div className="flex-1 px-5 py-6">
        {/* Top Badges and Actions */}
        <div className="flex items-center justify-between mb-5">
          {/* Tags */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${theme.tagBg} ${theme.tagText}`}
            >
              {course.code}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${theme.tagBg} ${theme.tagText}`}
            >
              {course.status}
            </span>
          </div>

          {/* Action Buttons: Tracking, Edit, Delete */}
          <div className="flex items-center gap-1.5">
            {/* Enrollment & Progress Tracking Icon (for HR Head) */}
            {isHrHead && (
              <button
                type="button"
                title="Enrollment & Progress Tracking"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hr-head/courses/${course.id}/enrollments`);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 shadow-sm transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Users className="w-4 h-4" />
              </button>
            )}

            {/* Edit Course Icon */}
            {onEdit && (
              <button
                type="button"
                title="Edit Course"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 shadow-sm transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Course Icon */}
            {onDelete && (
              <button
                type="button"
                title="Delete Course"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 shadow-sm transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Default Book Icon if not HR Head */}
            {!isHrHead && !onEdit && !onDelete && (
              <div
                className={`w-8 h-8 rounded-full ${theme.tagBg} flex items-center justify-center`}
              >
                <BookOpen className={`w-4 h-4 ${theme.tagText}`} />
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <h3
          className={`text-[28px] font-extrabold leading-tight tracking-tight mb-3 ${theme.text}`}
        >
          {course.title}
        </h3>
        <p className={`text-sm font-medium ${theme.desc} line-clamp-2`}>
          {course.description ||
            "Comprehensive training module designed to enhance practical skills and theoretical knowledge."}
        </p>
      </div>

      {/* Bottom Image Area */}
      <div className="h-[220px] rounded-[28px] overflow-hidden relative group">
        <img
          src={imageSrc}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Read More button */}
        <button className="absolute bottom-4 left-5 flex items-center gap-2 text-white/90 hover:text-white transition-colors group/btn">
          <span className="text-sm font-semibold">View Details</span>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover/btn:bg-white group-hover/btn:text-black transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}
