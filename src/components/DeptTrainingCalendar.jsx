"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  Plus, X, ChevronLeft, ChevronRight, UserCircle, Clock,
  Calendar as CalendarIcon, BookOpen, Trash2, Pencil, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import trainingData from "@/app/hr-head/training/training-data.json";
import workforceData from "@/app/hr-head/workforce/workforce-data.json";

/* ─── Color palette ─────────────────────────────────────────────────────────── */
const EVENT_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-300",    border: "border-blue-200 dark:border-blue-800" },
  { bg: "bg-teal-100 dark:bg-teal-900/30",    text: "text-teal-700 dark:text-teal-300",    border: "border-teal-200 dark:border-teal-800" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-rose-100 dark:bg-rose-900/30",    text: "text-rose-700 dark:text-rose-300",    border: "border-rose-200 dark:border-rose-800" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30",    text: "text-cyan-700 dark:text-cyan-300",    border: "border-cyan-200 dark:border-cyan-800" },
];

const WEEKDAYS     = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VIEW_OPTIONS = ["Month", "Week", "Day"];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

/* ─── Reusable Component ────────────────────────────────────────────────────── */
/**
 * @param {string} department  — The department name (e.g. "ICU", "Cardiology")
 *                               Filters both trainings and staff automatically.
 */
export function DeptTrainingCalendar({ department }) {
  // Dept-specific staff and trainings
  const [users] = useState(() =>
    workforceData.filter(u => u.department === department)
  );

  const departmentTrainings = useMemo(() =>
    trainingData.filter(t =>
      t.department === department || t.department === "All Departments"
    ),
  [department]);

  // Saved schedules per department
  const [trainings, setTrainings]   = useState([]);
  const [isLoaded, setIsLoaded]     = useState(false);

  // UI state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView]     = useState("Month");
  const [sidebarTab, setSidebarTab]     = useState("schedule");
  const [editingId, setEditingId]       = useState(null);

  const [formData, setFormData] = useState({
    title: "", fromDate: toDateStr(new Date()), toDate: toDateStr(new Date()),
    fromTime: "09:00", toTime: "10:00", assignedGroup: [],
  });

  /* ─── Persistence ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const key = `dept_trainings_${department}`;
    const saved = localStorage.getItem(key);
    if (saved) { try { setTrainings(JSON.parse(saved)); } catch {} }
    setIsLoaded(true);
  }, [department]);

  useEffect(() => {
    if (isLoaded)
      localStorage.setItem(`dept_trainings_${department}`, JSON.stringify(trainings));
  }, [trainings, isLoaded, department]);

  /* ─── Calendar Grid ─────────────────────────────────────────────────────── */
  const year        = calendarDate.getFullYear();
  const month       = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const calendarGrid = useMemo(() => {
    const rows = []; let row = [];
    for (let i = 0; i < firstDay; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) { rows.push(row); row = []; }
    }
    if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }
    return rows;
  }, [year, month, daysInMonth, firstDay]);

  const currentWeekDays = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return d;
    });
  }, [selectedDate]);

  const getEventsForDate = (ds) =>
    trainings.filter(t => ds >= t.fromDate && ds <= t.toDate);

  const getColor = (evt) => {
    const idx = (evt.colorIndex ?? parseInt(evt.id, 10) ?? 0) % EVENT_COLORS.length;
    return EVENT_COLORS[isNaN(idx) ? 0 : idx];
  };

  /* ─── Training Target Logic ─────────────────────────────────────────────── */
  const selectedTrainingMeta = useMemo(
    () => departmentTrainings.find(t => t.name === formData.title) || null,
    [formData.title, departmentTrainings]
  );
  const targetDesignation = selectedTrainingMeta?.designation || null;

  const eligibleUsers = useMemo(() => {
    if (!targetDesignation) return [];
    if (targetDesignation === "All Designations") return users;
    return users.filter(u => u.designation === targetDesignation);
  }, [targetDesignation, users]);

  /* ─── Handlers ──────────────────────────────────────────────────────────── */
  const handleDateClick = (newDate) => {
    setSelectedDate(newDate);
    const ds = toDateStr(newDate);
    setFormData(p => ({ ...p, fromDate: ds, toDate: ds }));
    setSidebarTab("day");
  };

  const handleTrainingSelect = (name) => {
    const meta = departmentTrainings.find(t => t.name === name);
    const des  = meta?.designation || null;
    let autoAssigned = [];
    if (des === "All Designations") autoAssigned = users.map(u => u.id);
    else if (des) autoAssigned = users.filter(u => u.designation === des).map(u => u.id);
    setFormData(p => ({ ...p, title: name, assignedGroup: autoAssigned }));
  };

  const handleGroupToggle = (uid) => {
    setFormData(prev => {
      const has = prev.assignedGroup.includes(uid);
      return { ...prev, assignedGroup: has ? prev.assignedGroup.filter(x => x !== uid) : [...prev.assignedGroup, uid] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Please select a training");
    if (!formData.fromTime || !formData.toTime) return alert("Please set times");
    if (formData.assignedGroup.length === 0) return alert("Please assign at least one staff member");

    if (editingId) {
      setTrainings(prev => prev.map(t => t.id === editingId ? { ...t, ...formData, assignMode: "Group" } : t));
      setEditingId(null);
    } else {
      setTrainings(prev => [...prev, {
        id: Date.now().toString(), ...formData,
        assignMode: "Group", status: "Pending",
        colorIndex: prev.length % EVENT_COLORS.length,
      }]);
    }
    setFormData(p => ({ title: "", fromDate: p.fromDate, toDate: p.toDate, fromTime: "09:00", toTime: "10:00", assignedGroup: [] }));
    setSidebarTab("schedule");
  };

  const handleEdit = (evt) => {
    setFormData({
      title: evt.title || "", fromDate: evt.fromDate || toDateStr(new Date()),
      toDate: evt.toDate || toDateStr(new Date()),
      fromTime: evt.fromTime || "09:00", toTime: evt.toTime || "10:00",
      assignedGroup: evt.assignedGroup || [],
    });
    setEditingId(evt.id);
    setSidebarTab("schedule");
  };

  const handleDelete = (id) => {
    if (confirm("Delete this training?"))
      setTrainings(prev => prev.filter(t => t.id !== id));
  };

  const selectedDateStr  = toDateStr(selectedDate);
  const selectedEvents   = getEventsForDate(selectedDateStr);

  /* ─── JSX ───────────────────────────────────────────────────────────────── */
  return (
    <div className="w-full h-full flex flex-col bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="shrink-0 mb-6">
        <PageHeader
          title="Training Calendar"
          description={`Schedule and manage training sessions for the ${department} department.`}
        />
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">

        {/* ── Left: Calendar ── */}
        <div className="xl:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">

          {/* Calendar Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {/* View Switcher */}
              <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                {VIEW_OPTIONS.map(v => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeView === v ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
              {/* Month / Nav */}
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white whitespace-nowrap">
                  {activeView === "Day"
                    ? selectedDate.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })
                    : activeView === "Week"
                    ? `${currentWeekDays[0].toLocaleDateString("default", { month: "short", day: "numeric" })} – ${currentWeekDays[6].toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`
                    : `${calendarDate.toLocaleString("default", { month: "long" })} ${year}`}
                </h2>
                <button onClick={() => {
                  if (activeView === "Month") setCalendarDate(new Date(year, month - 1, 1));
                  if (activeView === "Week") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7));
                  if (activeView === "Day")  setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
                }} className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (activeView === "Month") setCalendarDate(new Date(year, month + 1, 1));
                  if (activeView === "Week") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7));
                  if (activeView === "Day")  setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));
                }} className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button onClick={() => setSidebarTab("schedule")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
              <Plus className="w-4 h-4" /> Schedule Training
            </button>
          </div>

          {/* Calendar Body */}
          <div className="flex-1 overflow-y-auto p-5 themed-scroll">

            {/* Month View */}
            {activeView === "Month" && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-blue-100/50 dark:bg-blue-900/30 border-b border-slate-200 dark:border-slate-700">
                      {WEEKDAYS.map(d => (
                        <th key={d} className="py-3 text-center text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest border-r border-slate-200 dark:border-slate-700 last:border-r-0">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarGrid.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((day, ci) => {
                          if (!day) return <td key={ci} className="border border-slate-200 dark:border-slate-700 h-24 bg-slate-50/30 dark:bg-slate-900/50" />;
                          const cellDate = new Date(year, month, day);
                          const dateStr  = toDateStr(cellDate);
                          const isToday    = isSameDay(cellDate, new Date());
                          const isSelected = isSameDay(cellDate, selectedDate);
                          const dayEvents  = getEventsForDate(dateStr);
                          return (
                            <td key={ci} onClick={() => handleDateClick(cellDate)}
                              className={`border border-slate-200 dark:border-slate-700 h-24 align-top p-1.5 cursor-pointer transition-all ${isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}`}>
                              <div className="flex justify-end mb-1">
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-blue-600 text-white shadow-md" : isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                                  {day}
                                </span>
                              </div>
                              <div className="space-y-0.5 overflow-hidden max-h-[52px]">
                                {dayEvents.slice(0, 2).map(evt => {
                                  const c = getColor(evt);
                                  return (
                                    <div key={evt.id} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate ${c.bg} ${c.text} ${c.border} border`}>
                                      {evt.title} <span className="opacity-70">{evt.fromTime}</span>
                                    </div>
                                  );
                                })}
                                {dayEvents.length > 2 && <div className="text-[9px] font-bold text-blue-500 pl-1">+{dayEvents.length - 2} more</div>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Week View */}
            {activeView === "Week" && (
              <div className="grid grid-cols-7 h-full gap-2">
                {currentWeekDays.map((d, i) => {
                  const dateStr  = toDateStr(d);
                  const isToday    = isSameDay(d, new Date());
                  const isSelected = isSameDay(d, selectedDate);
                  const dayEvents  = getEventsForDate(dateStr);
                  return (
                    <div key={i} onClick={() => handleDateClick(d)}
                      className={`flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-500 border-transparent" : "hover:border-blue-400"}`}>
                      <div className={`text-center py-2 border-b border-slate-200 dark:border-slate-700 ${isToday ? "bg-blue-100/50 dark:bg-blue-900/30" : "bg-slate-100/50 dark:bg-slate-800/50"}`}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{WEEKDAYS[d.getDay()]}</p>
                        <p className={`text-lg font-extrabold ${isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}>{d.getDate()}</p>
                      </div>
                      <div className="flex-1 p-2 space-y-1.5 bg-white dark:bg-slate-900 min-h-[200px]">
                        {dayEvents.map(evt => {
                          const c = getColor(evt);
                          return (
                            <div key={evt.id} className={`p-1.5 rounded-lg text-xs font-bold ${c.bg} ${c.text} ${c.border} border`}>
                              <span className="truncate block">{evt.title}</span>
                              <span className="text-[9px] opacity-75">{evt.fromTime}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Day View */}
            {activeView === "Day" && (
              <div className="space-y-3">
                {getEventsForDate(toDateStr(selectedDate)).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-semibold">No trainings scheduled for this day.</p>
                  </div>
                ) : (
                  getEventsForDate(toDateStr(selectedDate)).sort((a, b) => a.fromTime.localeCompare(b.fromTime)).map(evt => {
                    const c = getColor(evt);
                    return (
                      <div key={evt.id} className={`p-4 rounded-2xl border ${c.border} ${c.bg} flex items-center gap-4`}>
                        <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-950/50 min-w-[70px] text-center">
                          <span className={`text-sm font-black ${c.text}`}>{evt.fromTime}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-bold truncate ${c.text}`}>{evt.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs font-semibold opacity-80">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {evt.fromTime} – {evt.toTime}</span>
                            <span className="flex items-center gap-1"><UserCircle className="w-3.5 h-3.5" /> {evt.assignedGroup?.length || 0} Staff</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="xl:col-span-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">

          {/* Tab Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              {[
                { key: "schedule", label: "Schedule", icon: Plus },
                { key: "day",      label: "Day",      icon: CalendarIcon },
                { key: "all",      label: `All (${trainings.length})`, icon: BookOpen },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setSidebarTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    sidebarTab === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Tab */}
          {sidebarTab === "schedule" && (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 space-y-5 overflow-y-auto themed-scroll">

              <div className="shrink-0">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Training</p>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                    <span className={formData.title ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                      {formData.title || "Select a training program..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 shadow-xl bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50 max-h-60 overflow-y-auto themed-scroll">
                    {departmentTrainings.map(t => (
                      <DropdownMenuItem key={t.id} onClick={() => handleTrainingSelect(t.name)}
                        className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                        {t.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Target badge */}
                {targetDesignation && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target:</span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{targetDesignation}</span>
                  </div>
                )}

                {/* Assign Staff */}
                {formData.title && (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Assign Staff
                      {eligibleUsers.length > 0 && (
                        <span className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-[9px]">
                          {formData.assignedGroup.length} / {eligibleUsers.length}
                        </span>
                      )}
                    </p>
                    <div className="max-h-[180px] overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-1 themed-scroll">
                      {eligibleUsers.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No eligible staff for this designation in {department}.</p>
                      ) : (
                        eligibleUsers.map(u => (
                          <label key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <input type="checkbox" checked={formData.assignedGroup.includes(u.id)} onChange={() => handleGroupToggle(u.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{u.designation}</p>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="shrink-0">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Date</p>
                <div className="flex gap-2">
                  {[["fromDate", "From"], ["toDate", "To"]].map(([key, label]) => (
                    <div key={key} className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">{label}</span>
                      <input type="date" value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="shrink-0">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Time</p>
                <div className="flex gap-2">
                  {[["fromTime", "From"], ["toTime", "To"]].map(([key, label]) => (
                    <div key={key} className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">{label}</span>
                      <input type="time" value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                      <button type="button" onClick={() => setFormData(p => ({ ...p, [key]: "" }))}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="shrink-0 pt-2">
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                  {editingId ? "Update Training" : "Confirm Schedule"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData(p => ({ ...p, title: "", assignedGroup: [], fromTime: "09:00", toTime: "10:00" })); }}
                    className="w-full py-2 mt-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Day Tab */}
          {sidebarTab === "day" && (
            <div className="flex-1 flex flex-col overflow-y-auto themed-scroll p-5">
              <div className="mb-4 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedEvents.length} Training{selectedEvents.length !== 1 ? "s" : ""} Scheduled</p>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No trainings on this date.</p>
                  <button type="button" onClick={() => setSidebarTab("schedule")} className="mt-3 text-xs font-bold text-blue-600 hover:underline">+ Schedule New</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(evt => {
                    const c = getColor(evt);
                    return (
                      <div key={evt.id} className={`p-4 rounded-2xl border ${c.border} ${c.bg} group transition-all hover:shadow-md`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${c.text}`}>{evt.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.fromTime} – {evt.toTime}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><UserCircle className="w-3 h-3" /> {evt.assignedGroup?.length || 0} Staff</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => handleEdit(evt)} className="p-1.5 rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"><Pencil className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* All Tab */}
          {sidebarTab === "all" && (
            <div className="flex-1 flex flex-col overflow-y-auto themed-scroll p-5">
              {trainings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No trainings scheduled yet.</p>
                  <button type="button" onClick={() => setSidebarTab("schedule")} className="mt-3 text-xs font-bold text-blue-600 hover:underline">+ Schedule New</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainings.map(evt => {
                    const c = getColor(evt);
                    return (
                      <div key={evt.id} className={`p-4 rounded-2xl border ${c.border} ${c.bg} group transition-all hover:shadow-md`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${c.text}`}>{evt.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {evt.fromDate}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.fromTime}</span>
                            </div>
                            <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                              <UserCircle className="w-3 h-3" /> {evt.assignedGroup?.length || 0} Staff
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => handleEdit(evt)} className="p-1.5 rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"><Pencil className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
