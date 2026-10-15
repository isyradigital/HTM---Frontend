"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  GraduationCap, 
  Award,
  Filter,
  BarChart3,
  Calendar,
  Building2
} from "lucide-react";
import { EnrollStaffModal } from "./EnrollStaffModal";
import { enrollStaffInCourse, removeStaffEnrollment } from "@/lib/enrollmentService";
import { useToast } from "@/components/ToastProvider";

/* ── Avatar initials color cycle (matching Workforce exactly) ─────────── */
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

export function CourseEnrollmentTracker({ 
  course, 
  enrollments = [], 
  onRefresh, 
  totalModules = 4 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Completed" | "In Progress" | "Not Started"
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const toast = useToast();

  // Metrics
  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter(e => e.status === "Completed" || e.progress === 100).length;
  const inProgressCount = enrollments.filter(e => e.status === "In Progress" || (e.progress > 0 && e.progress < 100)).length;
  const notStartedCount = enrollments.filter(e => e.status === "Not Started" || e.progress === 0).length;
  const avgProgress = totalEnrolled > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled) 
    : 0;

  // Filtered List
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const matchesSearch = 
        item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  const handleEnrollStaff = (staff) => {
    const res = enrollStaffInCourse({
      courseId: course.id,
      courseTitle: course.title,
      staff,
      totalModules: totalModules || 4
    });

    if (res.success) {
      toast.success(`${staff.name} has been enrolled into "${course.title}".`, {
        title: "Staff Enrolled"
      });
      if (onRefresh) onRefresh();
    } else {
      toast.error(res.message, { title: "Enrollment Failed" });
    }
  };

  const handleRemove = async (enrollment) => {
    const confirmed = await toast.confirm({
      title: "Remove Staff Enrollment?",
      message: `Are you sure you want to un-enroll ${enrollment.staffName} from this course?`,
      confirmText: "Un-enroll",
      cancelText: "Cancel",
      type: "danger"
    });

    if (!confirmed) return;

    removeStaffEnrollment(enrollment.id);
    toast.info(`${enrollment.staffName} has been removed from enrollment list.`, {
      title: "Enrollment Removed"
    });
    if (onRefresh) onRefresh();
  };

  const getStatusBadge = (status, progress) => {
    if (status === "Completed" || progress === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (status === "In Progress" || (progress > 0 && progress < 100)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock className="w-3 h-3" /> In Progress ({progress}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <AlertCircle className="w-3 h-3" /> Not Started
      </span>
    );
  };

  const existingStaffIds = enrollments.map(e => e.staffId);

  return (
    <div className="w-full h-full flex flex-col space-y-4 min-h-0">
      
      {/* ── Summary Metrics Row (Clean Typographic Dynamic Cards in Single Row) ─────────── */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 md:p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Total Enrolled Metric */}
        <div className="flex items-center gap-4 py-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 last:border-none">
          <span className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight select-none min-w-[2.2ch]">
            {totalEnrolled < 10 ? `0${totalEnrolled}` : totalEnrolled}
          </span>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Total Enrolled
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active staff members
            </p>
          </div>
        </div>

        {/* In Progress Metric */}
        <div className="flex items-center gap-4 py-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 last:border-none">
          <span className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight select-none min-w-[2.2ch]">
            {inProgressCount < 10 ? `0${inProgressCount}` : inProgressCount}
          </span>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              In Progress
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Learning currently
            </p>
          </div>
        </div>

        {/* 100% Completed Metric */}
        <div className="flex items-center gap-4 py-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 last:border-none">
          <span className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight select-none min-w-[2.2ch]">
            {completedCount < 10 ? `0${completedCount}` : completedCount}
          </span>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              100% Completed
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Passed & certified
            </p>
          </div>
        </div>

        {/* Avg Completion Metric */}
        <div className="flex items-center gap-4 py-2 px-3 last:border-none">
          <span className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight select-none min-w-[2.2ch]">
            {avgProgress}%
          </span>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Avg. Completion
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Overall course score
            </p>
          </div>
        </div>
      </div>

      {/* ── Table Card Container (Height Fit & Scrollable) ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        {/* Controls Header */}
        <div className="shrink-0 p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-800/20">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enrolled staff by name or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Filter Pills + Enroll Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              {[
                { id: "all", label: `All (${totalEnrolled})` },
                { id: "In Progress", label: `Ongoing (${inProgressCount})` },
                { id: "Completed", label: `Done (${completedCount})` },
                { id: "Not Started", label: `Pending (${notStartedCount})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    statusFilter === pill.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Staff</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto themed-scroll">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Staff Member</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Enrolled Date</th>
                <th className="py-3.5 px-4">Progress Tracker</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                    No staff enrollments match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    {/* Staff Name & ID (Workforce style letter avatar) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {item.staffName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                            {item.staffName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">{item.staffId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {item.department}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {item.designation}
                        </p>
                      </div>
                    </td>

                    {/* Enrolled Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.enrolledAt}</span>
                      </div>
                    </td>

                    {/* Progress Bar & Percentage */}
                    <td className="py-4 px-4 min-w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-700 dark:text-slate-300">
                            {item.completedModules || Math.round(((item.progress || 0) / 100) * totalModules)} / {totalModules} Modules
                          </span>
                          <span className={`${
                            item.progress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                          }`}>
                            {item.progress}%
                          </span>
                        </div>
                        {/* Progress Bar Track */}
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.progress === 100 
                                ? "bg-emerald-500" 
                                : item.progress > 50 
                                ? "bg-blue-600" 
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {getStatusBadge(item.status, item.progress)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemove(item)}
                        title="Un-enroll Staff"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding staff */}
      <EnrollStaffModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnroll={handleEnrollStaff}
        course={course}
        existingStaffIds={existingStaffIds}
      />
    </div>
  );
}
