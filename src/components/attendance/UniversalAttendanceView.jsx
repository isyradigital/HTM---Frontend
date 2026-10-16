"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  BookOpen, 
  Save, 
  Filter, 
  UserCheck, 
  UserX,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Layers,
  ChevronLeft
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import workforceData from "@/app/hr-head/workforce/workforce-data.json";
import trainingDataMaster from "@/app/hr-head/training/training-data.json";
import { initialCourses } from "@/app/hr-head/courses/page";
import { getEnrollments } from "@/lib/enrollmentService";

// Helper to format Date into YYYY-MM-DD
function toDateStr(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return "";
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate all individual dates between start and end (inclusive)
function getDatesInRange(startStr, endStr) {
  if (!startStr) return [];
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date(startStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return [startStr];
  }
  const dates = [];
  let curr = new Date(start);
  while (curr <= end) {
    dates.push(toDateStr(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

const ATTENDANCE_STORAGE_KEY = "hospital_session_attendance";

export function UniversalAttendanceView({ deptFilter }) {
  const toast = useToast();
  const todayStr = useMemo(() => toDateStr(new Date()), []);

  // ─── Tabs & Active Selection ───────────────────────────────────────────────
  const [rightTab, setRightTab] = useState("training"); // "training" | "course"
  const [selectedItem, setSelectedItem] = useState(null); // Selected training or course object
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "present" | "absent" | "unmarked"

  // Master lists
  const [trainingsList, setTrainingsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [enrollmentsList, setEnrollmentsList] = useState([]);

  // Attendance Map for current session & date: { [staffId]: "Present" | "Absent" | "Late" | "Excused" }
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  // ─── Header Info ───────────────────────────────────────────────────────────
  const headerTitle = deptFilter
    ? `${deptFilter} Attendance Tracker`
    : "Training & Course Attendance Tracker";

  const headerDescription = deptFilter
    ? `Take & monitor attendance for ${deptFilter} scheduled trainings and active courses.`
    : "Comprehensive attendance tracking for hospital scheduled trainings and professional courses.";

  // ─── Load Data ─────────────────────────────────────────────────────────────
  const loadData = () => {
    // 1. Load Trainings from calendar storage (hospital_trainings or dept_trainings_${deptFilter})
    const storageKey = deptFilter ? `dept_trainings_${deptFilter}` : "hospital_trainings";
    let storedTrainings = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        storedTrainings = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    // If nothing saved in calendar storage yet, provide realistic calendar-scheduled items
    if (!storedTrainings || storedTrainings.length === 0) {
      storedTrainings = [
        {
          id: "tr-cal-1",
          title: "Advanced Cardiac Life Support (ACLS) Workshop",
          fromDate: todayStr,
          toDate: toDateStr(new Date(Date.now() + 4 * 86400000)), // 5-day training
          fromTime: "09:30",
          toTime: "12:30",
          location: "Sim Lab 3B",
          department: deptFilter || "Cardiology",
          assignMode: "Group",
          targetDesignation: "All",
          assignedGroup: ["WF001", "WF002", "WF003", "WF008", "WF010", "WF006", "WF013"],
          status: "Approved",
          colorIndex: 0
        },
        {
          id: "tr-cal-2",
          title: "Comprehensive ICU & Ventilator Masterclass (10 Days)",
          fromDate: todayStr,
          toDate: toDateStr(new Date(Date.now() + 9 * 86400000)), // 10-day intensive training
          fromTime: "14:00",
          toTime: "17:00",
          location: "Main ICU Seminar Room",
          department: deptFilter || "ICU",
          assignMode: "Group",
          targetDesignation: "All",
          assignedGroup: ["WF004", "WF005", "WF006", "WF007", "WF009", "WF012", "WF016", "WF008"],
          status: "Approved",
          colorIndex: 1
        },
        {
          id: "tr-cal-3",
          title: "Neuro-Critical Care Protocols",
          fromDate: toDateStr(new Date(Date.now() + 86400000)), // tomorrow
          toDate: toDateStr(new Date(Date.now() + 3 * 86400000)), // 3-day training
          fromTime: "10:00",
          toTime: "12:00",
          location: "Neurology Seminar Room",
          department: deptFilter || "Neurology",
          assignMode: "Group",
          targetDesignation: "All",
          assignedGroup: ["WF002", "WF008", "WF004", "WF019"],
          status: "Approved",
          colorIndex: 2
        },
        {
          id: "tr-cal-4",
          title: "Hospital Infection Prevention & Sterilization Standards",
          fromDate: toDateStr(new Date(Date.now() + 2 * 86400000)),
          toDate: toDateStr(new Date(Date.now() + 4 * 86400000)),
          fromTime: "11:00",
          toTime: "13:00",
          location: "Conference Hall B",
          department: deptFilter || "All Departments",
          assignMode: "Group",
          targetDesignation: "Staff Nurse",
          assignedGroup: ["WF004", "WF007", "WF009", "WF001", "WF006", "WF012", "WF014"],
          status: "Approved",
          colorIndex: 3
        }
      ];
      try {
        localStorage.setItem(storageKey, JSON.stringify(storedTrainings));
      } catch {}
    }
    setTrainingsList(storedTrainings);

    // 2. Load Courses
    let storedCourses = [];
    try {
      const savedCourses = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
      const deletedDemo = JSON.parse(localStorage.getItem("deleted_demo_courses") || "[]");
      const filteredInitial = initialCourses.filter(c => !deletedDemo.includes(c.id));
      storedCourses = [...filteredInitial, ...savedCourses];
    } catch {
      storedCourses = initialCourses;
    }
    setCoursesList(storedCourses);

    // 3. Load Enrollments
    try {
      const enrollments = getEnrollments();
      setEnrollmentsList(enrollments);
    } catch {
      setEnrollmentsList([]);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [deptFilter, todayStr]);

  // ─── Filter Future/Upcoming Trainings ──────────────────────────────────────
  // User Requirement: "training celender se uss date se aage ke sare training show karna"
  const upcomingTrainings = useMemo(() => {
    return trainingsList.filter(t => {
      const endD = t.toDate || t.fromDate || t.date || "";
      const startD = t.fromDate || t.date || "";
      const isCurrentOrFuture = endD >= todayStr || startD >= todayStr;
      if (!isCurrentOrFuture) return false;
      if (deptFilter && t.department && t.department !== "All Departments" && t.department !== deptFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => (a.fromDate || "").localeCompare(b.fromDate || ""));
  }, [trainingsList, todayStr, deptFilter]);

  // ─── Auto-select first item on mount or tab change ──────────────────────────
  useEffect(() => {
    if (rightTab === "training") {
      if (upcomingTrainings.length > 0) {
        if (!selectedItem || selectedItem._type !== "training" || !upcomingTrainings.some(t => t.id === selectedItem.id)) {
          const first = upcomingTrainings[0];
          setSelectedItem({ ...first, _type: "training" });
          // If training has started before today or starts in future, pick a sensible active date
          const startDate = first.fromDate || todayStr;
          const endDate = first.toDate || startDate;
          if (todayStr >= startDate && todayStr <= endDate) {
            setSelectedDate(todayStr);
          } else {
            setSelectedDate(startDate);
          }
        }
      } else {
        setSelectedItem(null);
      }
    } else if (rightTab === "course") {
      if (coursesList.length > 0) {
        if (!selectedItem || selectedItem._type !== "course" || !coursesList.some(c => c.id === selectedItem.id)) {
          setSelectedItem({ ...coursesList[0], _type: "course" });
          setSelectedDate(todayStr);
        }
      } else {
        setSelectedItem(null);
      }
    }
  }, [rightTab, upcomingTrainings, coursesList]);

  // ─── Multi-Day Calculation for Selected Training ───────────────────────────
  // If training spans across multiple days (e.g. 5 days, 10 days)
  const trainingScheduleDays = useMemo(() => {
    if (!selectedItem || selectedItem._type !== "training") return [];
    const start = selectedItem.fromDate || selectedDate;
    const end = selectedItem.toDate || start;
    return getDatesInRange(start, end);
  }, [selectedItem, selectedDate]);

  const isMultiDayTraining = trainingScheduleDays.length > 1;

  // Active day index in the multi-day sequence (e.g., Day 1, Day 2... Day 10)
  const currentDayIndex = useMemo(() => {
    const idx = trainingScheduleDays.indexOf(selectedDate);
    return idx >= 0 ? idx + 1 : 1;
  }, [trainingScheduleDays, selectedDate]);

  // ─── Session Unique Storage Key (Stored Per Date) ──────────────────────────
  // Key format: training_{id}_{YYYY-MM-DD} or course_{id}_{YYYY-MM-DD}
  const sessionAttendanceKey = useMemo(() => {
    if (!selectedItem) return null;
    const type = selectedItem._type || rightTab;
    const id = selectedItem.id;
    return `${type}_${id}_${selectedDate}`;
  }, [selectedItem, rightTab, selectedDate]);

  // ─── Load Existing Attendance For Current Session & Selected Date ──────────
  useEffect(() => {
    if (!sessionAttendanceKey) {
      setAttendanceRecords({});
      setIsSaved(false);
      return;
    }
    try {
      const allAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || "{}");
      const record = allAttendance[sessionAttendanceKey];
      if (record && record.marks) {
        setAttendanceRecords(record.marks);
        setIsSaved(true);
      } else {
        setAttendanceRecords({});
        setIsSaved(false);
      }
    } catch {
      setAttendanceRecords({});
      setIsSaved(false);
    }
  }, [sessionAttendanceKey]);

  // ─── Resolve Target Staff for Selected Training / Course ───────────────────
  // User Requirement: "jab mai kisi training ko select karta hua to uss training ke sare staff member left side me show hone chahiye"
  const targetStaffList = useMemo(() => {
    if (!selectedItem) return [];

    if (selectedItem._type === "training" || rightTab === "training") {
      // 1. If assignedGroup array of IDs exists and is non-empty, resolve all those staff members
      if (Array.isArray(selectedItem.assignedGroup) && selectedItem.assignedGroup.length > 0) {
        const found = selectedItem.assignedGroup
          .map(id => workforceData.find(w => w.id === id))
          .filter(Boolean);
        if (found.length > 0) return found;
      }

      // 2. If single individual assignedUser exists
      if (selectedItem.assignedUser) {
        const found = workforceData.find(w => w.name === selectedItem.assignedUser);
        if (found) return [found];
      }

      // 3. If targetDesignation is set (e.g. "Senior Consultant", "Staff Nurse")
      if (selectedItem.targetDesignation && selectedItem.targetDesignation !== "All") {
        const desigStaff = workforceData.filter(w => w.designation === selectedItem.targetDesignation);
        if (desigStaff.length > 0) return desigStaff;
      }

      // 4. If training has a specific department
      if (selectedItem.department && selectedItem.department !== "All Departments") {
        const deptStaff = workforceData.filter(w => w.department === selectedItem.department);
        if (deptStaff.length > 0) return deptStaff;
      }

      // 5. Fallback: Entire active workforce department cohort (all available staff)
      return workforceData.filter(w => w.status === "Active");
    }

    if (selectedItem._type === "course" || rightTab === "course") {
      const enrolled = enrollmentsList.filter(e => String(e.courseId) === String(selectedItem.id));
      if (enrolled.length > 0) {
        return enrolled.map(e => {
          const wf = workforceData.find(w => w.id === e.staffId);
          return {
            id: e.staffId,
            name: e.staffName,
            department: e.department || wf?.department || "General",
            designation: e.designation || wf?.designation || "Staff",
            status: e.status,
            progress: e.progress
          };
        });
      }
      return workforceData.filter(w => w.status === "Active").slice(0, 8);
    }

    return [];
  }, [selectedItem, rightTab, enrollmentsList]);

  // Filtered staff list based on search and status
  const filteredStaffList = useMemo(() => {
    return targetStaffList.filter(staff => {
      const matchesSearch = 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.id.toLowerCase().includes(searchQuery.toLowerCase());

      const currentStatus = attendanceRecords[staff.id];
      if (statusFilter === "present" && currentStatus !== "Present") return false;
      if (statusFilter === "absent" && currentStatus !== "Absent") return false;
      if (statusFilter === "unmarked" && currentStatus) return false;

      return matchesSearch;
    });
  }, [targetStaffList, searchQuery, statusFilter, attendanceRecords]);

  // ─── Attendance Statistics ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = targetStaffList.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    targetStaffList.forEach(s => {
      const status = attendanceRecords[s.id];
      if (status === "Present") present++;
      else if (status === "Absent") absent++;
      else if (status === "Late") late++;
    });

    const marked = present + absent + late;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, unmarked: total - marked, percentage };
  }, [targetStaffList, attendanceRecords]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleMark = (staffId, status) => {
    setAttendanceRecords(prev => {
      const current = prev[staffId];
      if (current === status) {
        const next = { ...prev };
        delete next[staffId];
        return next;
      }
      return { ...prev, [staffId]: status };
    });
    setIsSaved(false);
  };

  const handleMarkAll = (status) => {
    const updated = { ...attendanceRecords };
    targetStaffList.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
    setIsSaved(false);
  };

  const handleClearAll = () => {
    setAttendanceRecords({});
    setIsSaved(false);
  };

  const handleSaveAttendance = () => {
    if (!sessionAttendanceKey || !selectedItem) return;

    try {
      const allAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || "{}");
      allAttendance[sessionAttendanceKey] = {
        sessionId: selectedItem.id,
        sessionType: selectedItem._type,
        sessionTitle: selectedItem.title || selectedItem.name,
        date: selectedDate,
        dayNumber: currentDayIndex,
        totalDays: trainingScheduleDays.length || 1,
        marks: attendanceRecords,
        savedAt: new Date().toISOString(),
        totalStaff: targetStaffList.length,
        presentCount: stats.present,
        absentCount: stats.absent
      };
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(allAttendance));
      setIsSaved(true);
      toast.success(
        `Attendance Saved for Day ${currentDayIndex} (${selectedDate})!`,
        `Recorded ${stats.present} Present, ${stats.absent} Absent out of ${stats.total} total staff.`
      );
    } catch {
      toast.error("Failed to Save", "An error occurred while storing attendance.");
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm gap-5">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <PageHeader
          title={headerTitle}
          description={headerDescription}
        />

        {/* Global Attendance Mode Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Today: {todayStr}</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Section Split Layout (Left = Large / Right = Tabs) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        
        {/* ═════════════════════════════════════════════════════════════════════════
            LEFT SECTION (LARGE): ATTENDANCE PROVISION & MARKING CANVAS (cols 8 / 12)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-0">
          
          {selectedItem ? (
            <>
              {/* ── Session Detail Header Banner ── */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30 dark:from-slate-800/50 dark:via-slate-900 dark:to-blue-950/20 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        selectedItem._type === "training"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                      }`}>
                        {selectedItem._type === "training" ? "Training Program" : "Course Cohort"}
                      </span>

                      {/* Multi-Day Pill Tag */}
                      {isMultiDayTraining && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
                          <Layers className="w-3 h-3 text-indigo-600" />
                          {trainingScheduleDays.length} Days Schedule (Day {currentDayIndex})
                        </span>
                      )}

                      {isSaved && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                          <Check className="w-3 h-3" /> Saved for {selectedDate}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate">
                      {selectedItem.title || selectedItem.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                      {selectedItem.department && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Dept: <strong>{selectedItem.department}</strong>
                        </span>
                      )}
                      {selectedItem.fromTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {selectedItem.fromTime} {selectedItem.toTime ? `- ${selectedItem.toTime}` : ""}
                        </span>
                      )}
                      {selectedItem.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selectedItem.location}
                        </span>
                      )}
                      {selectedItem.code && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          Code: {selectedItem.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Date Selector & Save Provision */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer font-medium text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSaveAttendance}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Attendance
                    </button>
                  </div>
                </div>

                {/* ── Multi-Day Training Timeline Bar (When Training Spans 2+ Days e.g. 10 Days) ── */}
                {isMultiDayTraining && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        Multi-Day Attendance Sessions ({trainingScheduleDays.length} Days Total)
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Click any day to take date-wise attendance
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 themed-scroll">
                      {trainingScheduleDays.map((dStr, idx) => {
                        const dayNum = idx + 1;
                        const isDaySelected = dStr === selectedDate;
                        const isToday = dStr === todayStr;

                        // Check if this date has saved attendance in localStorage
                        let dayHasSavedData = false;
                        try {
                          const allAtt = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || "{}");
                          const key = `${selectedItem._type || rightTab}_${selectedItem.id}_${dStr}`;
                          if (allAtt[key] && allAtt[key].marks && Object.keys(allAtt[key].marks).length > 0) {
                            dayHasSavedData = true;
                          }
                        } catch {}

                        return (
                          <button
                            key={dStr}
                            type="button"
                            onClick={() => setSelectedDate(dStr)}
                            className={`flex flex-col items-center justify-center min-w-[76px] py-2 px-2.5 rounded-2xl border text-xs transition-all shrink-0 ${
                              isDaySelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30 scale-105"
                                : dayHasSavedData
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50"
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                              Day {dayNum}
                            </span>
                            <span className="font-extrabold text-[11px] mt-0.5">
                              {dStr.slice(5)}
                            </span>
                            {isToday && (
                              <span className={`text-[8px] font-black uppercase px-1 rounded mt-0.5 ${
                                isDaySelected ? "bg-white text-blue-600" : "bg-blue-100 text-blue-700"
                              }`}>
                                Today
                              </span>
                            )}
                            {dayHasSavedData && !isDaySelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Stats Summary Badges ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">Total Assigned Staff</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{stats.total}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Present (Day {currentDayIndex})</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{stats.present}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Absent (Day {currentDayIndex})</p>
                      <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{stats.absent}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <UserX className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Turnout Rate</p>
                      <p className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">{stats.percentage}%</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Table Toolbar (Search, Filter, Quick Batch Actions) ── */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search staff by name, designation, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Filters */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "all" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      All ({targetStaffList.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("present")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "present" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      Present ({stats.present})
                    </button>
                    <button
                      onClick={() => setStatusFilter("absent")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "absent" ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      Absent ({stats.absent})
                    </button>
                  </div>

                  {/* Batch Buttons */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleMarkAll("Present")}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold transition-all"
                      title="Mark all staff as Present"
                    >
                      All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll("Absent")}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 text-[11px] font-bold transition-all"
                      title="Mark all staff as Absent"
                    >
                      All Absent
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] font-semibold transition-all"
                      title="Clear attendance marks"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Attendance Staff Table ── */}
              <div className="flex-1 overflow-y-auto themed-scroll">
                {filteredStaffList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Users className="w-12 h-12 stroke-[1.2] opacity-30 mb-2" />
                    <p className="text-sm font-semibold">No participants found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? "Try refining your search query." : "No staff enrolled in this session."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Designation</th>
                        <th className="py-3 px-4 text-center">
                          Day {currentDayIndex} Status ({selectedDate})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                      {filteredStaffList.map((staff) => {
                        const status = attendanceRecords[staff.id];
                        return (
                          <tr 
                            key={staff.id} 
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              status === "Present"
                                ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                                : status === "Absent"
                                ? "bg-rose-50/20 dark:bg-rose-950/10"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                  {staff.name.replace("Dr. ", "").replace("Nurse ", "").replace("Mr. ", "").replace("Ms. ", "").charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 dark:text-white truncate">
                                    {staff.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    ID: {staff.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {staff.department}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                              {staff.designation}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Present Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMark(staff.id, "Present")}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                    status === "Present"
                                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30 scale-105"
                                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40"
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Present
                                </button>

                                {/* Absent Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMark(staff.id, "Absent")}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                    status === "Absent"
                                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-500/30 scale-105"
                                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-800/40"
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                                </button>

                                {/* Late / Partial Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMark(staff.id, "Late")}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                    status === "Late"
                                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30 scale-105"
                                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/40"
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Late
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <CalendarIcon className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Session Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select an upcoming training from the calendar list on the right, or choose a course to mark attendance.
              </p>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            RIGHT SECTION: TWO TABS (TRAINING & COURSE) (cols 4 / 12)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-0">
          
          {/* ── Tab Switcher: Training vs Course ── */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 shrink-0">
            <div className="grid grid-cols-2 p-1 bg-slate-200/60 dark:bg-slate-800/90 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setRightTab("training")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  rightTab === "training"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Training
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {upcomingTrainings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRightTab("course")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  rightTab === "course"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Course
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                  {coursesList.length}
                </span>
              </button>
            </div>
          </div>

          {/* ── Tab Content: Training View (Trainings >= Today) ── */}
          {rightTab === "training" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/60 dark:border-blue-900/30 flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Upcoming Calendar Schedule
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  From: {todayStr} onwards
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 themed-scroll">
                {upcomingTrainings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <CalendarIcon className="w-10 h-10 opacity-20 mb-2" />
                    <p className="text-xs font-semibold">No upcoming trainings scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Check back later or schedule new sessions in the Training Calendar.
                    </p>
                  </div>
                ) : (
                  upcomingTrainings.map((training) => {
                    const isSelected = selectedItem?._type === "training" && selectedItem?.id === training.id;
                    const dateFormatted = training.fromDate || todayStr;
                    const isToday = dateFormatted === todayStr;
                    const totalDays = getDatesInRange(training.fromDate, training.toDate).length;

                    // Compute assigned staff count accurately
                    let assignedCount = 0;
                    if (Array.isArray(training.assignedGroup) && training.assignedGroup.length > 0) {
                      assignedCount = training.assignedGroup.length;
                    } else if (training.assignedUser) {
                      assignedCount = 1;
                    } else if (training.targetDesignation && training.targetDesignation !== "All") {
                      assignedCount = workforceData.filter(w => w.designation === training.targetDesignation).length;
                    } else if (training.department && training.department !== "All Departments") {
                      assignedCount = workforceData.filter(w => w.department === training.department).length;
                    } else {
                      assignedCount = workforceData.length;
                    }

                    return (
                      <div
                        key={training.id}
                        onClick={() => {
                          setSelectedItem({ ...training, _type: "training" });
                          const startDate = training.fromDate || todayStr;
                          const endDate = training.toDate || startDate;
                          if (todayStr >= startDate && todayStr <= endDate) {
                            setSelectedDate(todayStr);
                          } else {
                            setSelectedDate(startDate);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20"
                            : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isToday ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">
                                  Today
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                                  {dateFormatted}
                                </span>
                              )}

                              {totalDays > 1 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                                  {totalDays} Days
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400 font-medium">
                                {training.department || "General"}
                              </span>
                            </div>

                            <h4 className={`text-xs font-bold mt-1.5 line-clamp-1 ${
                              isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-white"
                            }`}>
                              {training.title || training.name}
                            </h4>

                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {training.fromTime || "09:00"} {training.toTime ? `- ${training.toTime}` : ""}
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                                <Users className="w-3 h-3 text-blue-500" />
                                {assignedCount} Staff
                              </span>
                            </div>
                          </div>

                          <div className={`p-1.5 rounded-xl transition-all ${
                            isSelected ? "text-blue-600 bg-blue-100 dark:bg-blue-900/60" : "text-slate-300 group-hover:text-blue-500"
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── Tab Content: Course View ── */}
          {rightTab === "course" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-3 bg-teal-50/40 dark:bg-teal-950/20 border-b border-teal-100/60 dark:border-teal-900/30 flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  Active Course Programs
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Select to mark attendance
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 themed-scroll">
                {coursesList.map((course) => {
                  const isSelected = selectedItem?._type === "course" && selectedItem?.id === course.id;
                  const enrolledCount = enrollmentsList.filter(e => String(e.courseId) === String(course.id)).length;

                  return (
                    <div
                      key={course.id}
                      onClick={() => {
                        setSelectedItem({ ...course, _type: "course" });
                        setSelectedDate(todayStr);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                        isSelected
                          ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 dark:border-teal-500 shadow-md ring-1 ring-teal-500/20"
                          : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold">
                              {course.code || `CRS-${course.id}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {course.status || "Active"}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold mt-1.5 line-clamp-1 ${
                            isSelected ? "text-teal-700 dark:text-teal-300" : "text-slate-800 dark:text-white"
                          }`}>
                            {course.title}
                          </h4>

                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {course.description || "Hospital workforce clinical training curriculum"}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                              <Users className="w-3 h-3 text-teal-500" />
                              {enrolledCount || 4} Enrolled Staff
                            </span>
                          </div>
                        </div>

                        <div className={`p-1.5 rounded-xl transition-all ${
                          isSelected ? "text-teal-600 bg-teal-100 dark:bg-teal-900/60" : "text-slate-300 group-hover:text-teal-500"
                        }`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default UniversalAttendanceView;
