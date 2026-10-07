"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Plus, X, ChevronLeft, ChevronRight, MapPin, UserCircle, Clock, Calendar as CalendarIcon, BookOpen, Users, Trash2, Pencil, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import trainingData from "../training/training-data.json";
import workforceData from "../workforce/workforce-data.json";
import { BulkUpload } from "@/components/BulkUpload";

/* ─── Medical Color palette for events ─────────────────────────────────────── */
const EVENT_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500", border: "border-blue-200 dark:border-blue-800" }, // General Medical
  { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500", border: "border-teal-200 dark:border-teal-800" }, // Surgery / ER
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800" }, // Pharmacy / Wellness
  { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500", border: "border-rose-200 dark:border-rose-800" }, // Emergency / Blood
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500", border: "border-indigo-200 dark:border-indigo-800" }, // Lab / Tests
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500", border: "border-cyan-200 dark:border-cyan-800" }, // Radiology / Therapy
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MINI_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const VIEW_OPTIONS = ["Month", "Week", "Day"];

/* ─── Date helpers ──────────────────────────────────────────────────────────── */
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function isSameDay(a, b) { return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }

/* ──────────────────────────────────────────────────────────────────────────── */
export default function TrainingSchedulePage() {
  const [users, setUsers] = useState([]);
  const [trainings, setTrainings] = useState([
    { id: "1", title: "Basic Life Support", fromDate: toDateStr(new Date()), toDate: toDateStr(new Date()), fromTime: "10:30", toTime: "11:30", type: "Event", assignMode: "Individual", status: "Pending", colorIndex: 0 },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calendar view state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState("Month");

  // Mini calendar in sidebar
  const [miniCalDate, setMiniCalDate] = useState(new Date());

  // Form State
  const [activeType, setActiveType] = useState("Event");
  const [formData, setFormData] = useState({
    title: "",
    fromDate: toDateStr(new Date()),
    toDate: toDateStr(new Date()),
    fromTime: "09:00",
    toTime: "10:00",
    location: "",
    assignedUser: "",
    assignedGroup: [],
  });
  const [assignMode, setAssignMode] = useState("Individual");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("schedule"); // "schedule" | "trainings"
  const [editingId, setEditingId] = useState(null); // null = new, id = editing

  /* ─── Load / Save ──────────────────────────────────────────────────────── */
  const loadTrainings = () => {
    setUsers(workforceData);
    const savedTrainings = localStorage.getItem("hospital_trainings");
    if (savedTrainings) { try { setTrainings(JSON.parse(savedTrainings)); } catch {} } else {
      setTrainings([
        { id: "1", title: "Basic Life Support", fromDate: toDateStr(new Date()), toDate: toDateStr(new Date()), fromTime: "10:30", toTime: "11:30", type: "Event", assignMode: "Individual", status: "Pending", colorIndex: 0 }
      ]);
    }
  };

  useEffect(() => {
    loadTrainings();
    setIsLoaded(true);

    const handleStorageChange = (e) => {
      if (e.key === "hospital_trainings") {
        loadTrainings();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("hospital_trainings", JSON.stringify(trainings));
  }, [trainings, isLoaded]);

  /* ─── Calendar Navigation ──────────────────────────────────────────────── */
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  /* ─── View Data Generators ─────────────────────────────────────────────── */
  // Month Grid
  const calendarGrid = useMemo(() => {
    const rows = [];
    let row = [];
    for (let i = 0; i < firstDay; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) { rows.push(row); row = []; }
    }
    if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }
    return rows;
  }, [year, month, daysInMonth, firstDay]);

  // Week Grid
  const currentWeekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Events on a specific date
  const getEventsForDate = (dateStr) => trainings.filter(t => dateStr >= t.fromDate && dateStr <= t.toDate);

  /* ─── Form Handlers ────────────────────────────────────────────────────── */
  const handleDateClick = (newDate) => {
    setSelectedDate(newDate);
    const ds = toDateStr(newDate);
    setFormData(p => ({ ...p, fromDate: ds, toDate: ds }));
    setSidebarTab("day");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Please select a training");
    if (!formData.fromTime || !formData.toTime) return alert("Please set From and To times");
    
    // Auto Assign Mode: Group
    if (formData.assignedGroup.length === 0) return alert("Please select at least one staff member to assign");

    if (editingId) {
      // Update existing
      setTrainings(prev => prev.map(t => t.id === editingId ? { ...t, ...formData, type: activeType, assignMode: "Group" } : t));
      setEditingId(null);
    } else {
      // Create new
      const newTraining = {
        id: Date.now().toString(),
        ...formData,
        type: activeType,
        assignMode: "Group",
        status: "Pending",
        colorIndex: trainings.length % EVENT_COLORS.length,
      };
      setTrainings(prev => [...prev, newTraining]);
    }
    setFormData({ title: "", fromDate: formData.fromDate, toDate: formData.toDate, fromTime: "09:00", toTime: "10:00", location: "", assignedUser: "", assignedGroup: [] });
  };

  const handleBulkUpload = (newTrainings) => {
    // Generate new color index for each and add to state
    const processed = newTrainings.map((t, idx) => ({
      ...t,
      colorIndex: (trainings.length + idx) % EVENT_COLORS.length
    }));
    setTrainings(prev => [...prev, ...processed]);
  };

  const handleEdit = (evt) => {
    setFormData({
      title: evt.title || "",
      fromDate: evt.fromDate || toDateStr(new Date()),
      toDate: evt.toDate || toDateStr(new Date()),
      fromTime: evt.fromTime || "09:00",
      toTime: evt.toTime || "10:00",
      location: evt.location || "",
      assignedUser: evt.assignedUser || "",
      assignedGroup: evt.assignedGroup || [],
    });
    setAssignMode(evt.assignMode || "Individual");
    setEditingId(evt.id);
    setSidebarTab("schedule");
  };

  const handleDelete = (id) => {
    if (confirm("Delete this training?")) setTrainings(prev => prev.filter(t => t.id !== id));
  };

  const handleGroupToggle = (uid) => {
    setFormData(prev => {
      const has = prev.assignedGroup.includes(uid);
      return { ...prev, assignedGroup: has ? prev.assignedGroup.filter(x => x !== uid) : [...prev.assignedGroup, uid] };
    });
  };

  /* ─── Mini Calendar ────────────────────────────────────────────────────── */
  const miniDaysInMonth = getDaysInMonth(miniCalDate.getFullYear(), miniCalDate.getMonth());
  const miniFirstDay = getFirstDayOfMonth(miniCalDate.getFullYear(), miniCalDate.getMonth());

  /* ─── Training Target Logic ────────────────────────────────────────────── */
  const selectedTrainingData = useMemo(() => {
    return trainingData.find(t => t.name === formData.title) || null;
  }, [formData.title]);

  const targetDesignation = selectedTrainingData ? selectedTrainingData.designation : null;

  // Get eligible users based on the selected training's target designation
  const eligibleUsers = useMemo(() => {
    if (!targetDesignation) return [];
    if (targetDesignation === "All Designations") return users;
    return users.filter(u => u.designation === targetDesignation);
  }, [targetDesignation, users]);

  // When training changes, auto-select all eligible users
  const handleTrainingSelect = (trainingName) => {
    const data = trainingData.find(t => t.name === trainingName);
    const targetDes = data ? data.designation : null;
    let autoAssigned = [];
    if (targetDes === "All Designations") autoAssigned = users.map(u => u.id);
    else if (targetDes) autoAssigned = users.filter(u => u.designation === targetDes).map(u => u.id);

    setFormData(p => ({ 
      ...p, 
      title: trainingName,
      assignedGroup: autoAssigned,
      assignedUser: "" 
    }));
  };

  /* ─── Selected day events (left-bottom of reference) ───────────────────── */
  const selectedDateStr = toDateStr(selectedDate);
  const selectedEvents = getEventsForDate(selectedDateStr);

  /* ─── Event color helper (consistent per training) ─────────────────────── */
  const getColor = (evt) => {
    let idx = evt.colorIndex;
    if (idx === undefined || idx >= EVENT_COLORS.length || isNaN(idx)) {
      idx = parseInt(evt.id, 10);
      if (isNaN(idx)) idx = 0;
    }
    return EVENT_COLORS[idx % EVENT_COLORS.length] || EVENT_COLORS[0];
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      
      <div className="shrink-0 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader 
          title="Training Schedule" 
          description="Schedule and manage training sessions for hospital staff."
        />

        {/* Upcoming Trainings Summary Strip */}
        {trainings.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Upcoming ({trainings.length})
            </span>
            <div className="flex gap-2 flex-wrap">
              {trainings.slice(0, 4).map(evt => {
                const c = getColor(evt);
                return (
                  <div key={evt.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${c.border} ${c.bg} transition-all hover:shadow-sm group`}>
                    {evt.status === "Pending" && <Clock className={`w-3.5 h-3.5 shrink-0 ${c.text}`} />}
                    {evt.status === "Approved" && <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${c.text}`} />}
                    {evt.status === "Rejected" && <XCircle className={`w-3.5 h-3.5 shrink-0 ${c.text}`} />}
                    <span className={`text-xs font-bold ${c.text} truncate max-w-[120px]`}>{evt.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{evt.fromTime}</span>
                    <button type="button" onClick={() => handleDelete(evt.id)} className="p-0.5 rounded text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {trainings.length > 4 && (
                <span className="text-[10px] font-bold text-blue-500 self-center">+{trainings.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  LEFT: CALENDAR GRID (3 cols)                                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          
          {/* Header Area */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* View Buttons */}
              <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                {VIEW_OPTIONS.map(v => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeView === v ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}>{v}</button>
                ))}
              </div>
              {/* Month / Year + Nav Arrows */}
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white whitespace-nowrap">
                  {activeView === "Day" 
                    ? selectedDate.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })
                    : activeView === "Week"
                    ? `${currentWeekDays[0].toLocaleDateString("default", { month: "short", day: "numeric" })} - ${currentWeekDays[6].toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`
                    : `${calendarDate.toLocaleString("default", { month: "long" })} ${year}`}
                </h2>
                <button onClick={() => {
                  if (activeView === "Month") prevMonth();
                  if (activeView === "Week") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7));
                  if (activeView === "Day") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
                }} className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => {
                  if (activeView === "Month") nextMonth();
                  if (activeView === "Week") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7));
                  if (activeView === "Day") setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));
                }} className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarTab("bulk")}
                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-4 py-2.5 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/50 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                Bulk Upload
              </button>
              <button onClick={() => { setFormData({ title: "", fromDate: toDateStr(new Date()), toDate: toDateStr(new Date()), fromTime: "09:00", toTime: "10:00", location: "", assignedUser: "", assignedGroup: [] }); setEditingId(null); setSidebarTab("schedule"); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                <Plus className="w-4 h-4" /> Add Training
              </button>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="flex-1 overflow-y-auto p-5 themed-scroll">
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
                        if (day === null) return <td key={ci} className="border border-slate-200 dark:border-slate-700 h-24 bg-slate-50/30 dark:bg-slate-900/50"></td>;

                        const cellDate = new Date(year, month, day);
                        const dateStr = toDateStr(cellDate);
                        const isToday = isSameDay(cellDate, new Date());
                        const isSelected = isSameDay(cellDate, selectedDate);
                        const dayEvents = getEventsForDate(dateStr);

                        return (
                          <td key={ci}
                            onClick={() => handleDateClick(cellDate)}
                            className={`border border-slate-200 dark:border-slate-700 h-24 align-top p-1.5 cursor-pointer transition-all group relative
                              ${isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}
                            `}
                          >
                            {/* Day Number */}
                            <div className="flex justify-end mb-1">
                              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all
                                ${isToday ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" :
                                  isSelected ? "text-blue-600 dark:text-blue-400 font-bold" :
                                  "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}
                              `}>
                                {day}
                              </span>
                            </div>

                            {/* Event Pills */}
                            <div className="space-y-0.5 overflow-hidden max-h-[52px]">
                              {dayEvents.slice(0, 2).map(evt => {
                                const color = getColor(evt);
                                return (
                                  <div key={evt.id} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center justify-between gap-1 ${color.bg} ${color.text} ${color.border} border`}>
                                    <div className="truncate flex-1">
                                      {evt.title} <span className="ml-1 opacity-70">{evt.fromTime}</span>
                                    </div>
                                    {evt.status === "Pending" && <Clock className="w-2.5 h-2.5 shrink-0" />}
                                    {evt.status === "Approved" && <CheckCircle className="w-2.5 h-2.5 shrink-0" />}
                                    {evt.status === "Rejected" && <XCircle className="w-2.5 h-2.5 shrink-0" />}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-[9px] font-bold text-blue-500 pl-1">+{dayEvents.length - 2} more</div>
                              )}
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

            {activeView === "Week" && (
              <div className="grid grid-cols-7 h-full gap-2">
                {currentWeekDays.map((d, i) => {
                  const dateStr = toDateStr(d);
                  const isToday = isSameDay(d, new Date());
                  const isSelected = isSameDay(d, selectedDate);
                  const dayEvents = getEventsForDate(dateStr);
                  return (
                    <div key={i} onClick={() => { handleDateClick(d); setCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1)); }} 
                      className={`flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-sm' : 'hover:border-blue-400'}`}>
                      <div className={`text-center py-2 border-b border-slate-200 dark:border-slate-700 ${isToday ? 'bg-blue-100/50 dark:bg-blue-900/30' : 'bg-slate-100/50 dark:bg-slate-800/50'}`}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{WEEKDAYS[d.getDay()]}</p>
                        <p className={`text-lg font-extrabold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{d.getDate()}</p>
                      </div>
                      <div className="flex-1 p-2 space-y-1.5 bg-white dark:bg-slate-900 overflow-y-auto min-h-[200px]">
                        {dayEvents.map(evt => {
                          const color = getColor(evt);
                          return (
                            <div key={evt.id} className={`p-1.5 rounded-lg text-xs font-bold ${color.bg} ${color.text} ${color.border} border flex items-start justify-between gap-1`}>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate">{evt.title}</span>
                                <span className="text-[9px] opacity-75">{evt.fromTime}</span>
                              </div>
                              {evt.status === "Pending" && <Clock className="w-3 h-3 shrink-0 mt-0.5" />}
                              {evt.status === "Approved" && <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" />}
                              {evt.status === "Rejected" && <XCircle className="w-3 h-3 shrink-0 mt-0.5" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === "Day" && (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex flex-col space-y-2">
                  {getEventsForDate(toDateStr(selectedDate)).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                      <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm font-semibold">No trainings scheduled for this day.</p>
                    </div>
                  ) : (
                    getEventsForDate(toDateStr(selectedDate)).sort((a,b) => a.fromTime.localeCompare(b.fromTime)).map(evt => {
                      const color = getColor(evt);
                      return (
                        <div key={evt.id} className={`p-4 rounded-2xl border ${color.border} ${color.bg} flex items-center gap-4 transition-all hover:shadow-md`}>
                          <div className={`p-3 rounded-xl bg-white/50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-w-[70px] shrink-0`}>
                            <span className={`text-sm font-black ${color.text}`}>{evt.fromTime}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-bold truncate ${color.text}`}>{evt.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-xs font-semibold opacity-80 flex-wrap">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {evt.fromTime} - {evt.toTime}</span>
                              {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>}
                              <span className="flex items-center gap-1"><UserCircle className="w-3.5 h-3.5" /> {evt.assignMode === "Group" ? `${evt.assignedGroup?.length || 0} Users` : (evt.assignedUser || "Unassigned")}</span>
                            </div>
                          </div>
                          <div className={`shrink-0 flex items-center justify-center px-2 ${color.text}`}>
                            {evt.status === "Pending" && <Clock className="w-5 h-5" />}
                            {evt.status === "Approved" && <CheckCircle className="w-5 h-5" />}
                            {evt.status === "Rejected" && <XCircle className="w-5 h-5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  RIGHT: SIDEBAR FORM (1 col)                                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <button type="button" onClick={() => setSidebarTab("schedule")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  sidebarTab === "schedule" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}>
                <Plus className="w-3.5 h-3.5" /> Schedule
              </button>
              <button type="button" onClick={() => setSidebarTab("day")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  sidebarTab === "day" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}>
                <CalendarIcon className="w-3.5 h-3.5" /> Selected
              </button>
              <button type="button" onClick={() => setSidebarTab("trainings")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  sidebarTab === "trainings" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}>
                <BookOpen className="w-3.5 h-3.5" /> All ({trainings.length})
              </button>
            </div>
          </div>

          {/* ── Tab: Bulk Upload ──────────────────────────────── */}
          {sidebarTab === "bulk" && (
            <BulkUpload onUploadSuccess={(data) => {
              handleBulkUpload(data);
              setSidebarTab("schedule");
            }} />
          )}

          {/* ── Tab: Schedule Form ──────────────────────────────── */}
          {sidebarTab === "schedule" && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 space-y-6 overflow-y-auto themed-scroll">

            {/* Title */}
            <div className="shrink-0">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Training</p>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium transition-all flex items-center justify-between text-left cursor-pointer">
                  <span className={formData.title ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {formData.title || "Select a training program..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50 max-h-64 overflow-y-auto themed-scroll">
                  {trainingData.map(t => (
                    <DropdownMenuItem 
                      key={t.id}
                      onClick={() => handleTrainingSelect(t.name)}
                      className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {targetDesignation && (
                <div className="mt-2 flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Designation:</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                    {targetDesignation}
                  </span>
                </div>
              )}

              {/* Assign Staff — shown right after designation */}
              {formData.title && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Assign Staff
                      {eligibleUsers.length > 0 && (
                        <span className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-[9px]">
                          {formData.assignedGroup.length} / {eligibleUsers.length}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-1 themed-scroll">
                    {eligibleUsers.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No eligible staff found for this designation.</p>
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
                              <p className="text-[10px] text-slate-500 truncate">{u.department} • {u.speciality || "General"}</p>
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
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl relative group border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">From</span>
                  <input type="date" value={formData.fromDate} onChange={e => {
                    setFormData(p => ({ ...p, fromDate: e.target.value }));
                    if(e.target.value) {
                      const d = new Date(e.target.value);
                      setSelectedDate(d);
                      setCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    }
                  }}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium font-sans text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl relative group border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">To</span>
                  <input type="date" value={formData.toDate} onChange={e => setFormData(p => ({ ...p, toDate: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium font-sans text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="shrink-0">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Time</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl relative group border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">From</span>
                  <input type="time" value={formData.fromTime} onChange={e => setFormData(p => ({ ...p, fromTime: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium font-sans text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, fromTime: "" }))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl relative group border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">To</span>
                  <input type="time" value={formData.toTime} onChange={e => setFormData(p => ({ ...p, toTime: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium font-sans text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer dark:[color-scheme:dark]" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, toTime: "" }))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              </div>
            </div>


            {/* Submit */}
            <div className="pt-2 shrink-0">
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                {editingId ? "Update Training" : "Confirm Schedule"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ title: "", fromDate: formData.fromDate, toDate: formData.toDate, fromTime: "09:00", toTime: "10:00", location: "", assignedUser: "", assignedGroup: [] }); }}
                  className="w-full py-2 mt-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>



          </form>
          )}

          {/* ── Tab: Scheduled Trainings List ───────────────────── */}
          {sidebarTab === "trainings" && (
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
                      <div key={evt.id} className={`p-4 rounded-2xl border ${c.border} ${c.bg} transition-all hover:shadow-md group`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-bold flex items-center justify-between gap-1.5 ${c.text}`}>
                              <span className="truncate">{evt.title}</span>
                              {evt.status === "Pending" && <Clock className="w-3.5 h-3.5 shrink-0" />}
                              {evt.status === "Approved" && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                              {evt.status === "Rejected" && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {evt.fromDate}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.fromTime} - {evt.toTime}</span>
                            </div>
                            {evt.location && (
                              <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400"><MapPin className="w-3 h-3" /> {evt.location}</p>
                            )}
                            <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                              <UserCircle className="w-3 h-3" /> {evt.assignMode === "Group" ? `${evt.assignedGroup?.length || 0} Staff` : (evt.assignedUser || "Unassigned")}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => handleEdit(evt)} className="p-1.5 rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Selected Day Trainings List ────────────────── */}
          {sidebarTab === "day" && (
            <div className="flex-1 flex flex-col overflow-y-auto themed-scroll p-5">
              <div className="mb-4 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {selectedEvents.length} Training{selectedEvents.length !== 1 ? "s" : ""} Scheduled
                </p>
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
                      <div key={evt.id} className={`p-4 rounded-2xl border ${c.border} ${c.bg} transition-all hover:shadow-md group`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-bold flex items-center justify-between gap-1.5 ${c.text}`}>
                              <span className="truncate">{evt.title}</span>
                              {evt.status === "Pending" && <Clock className="w-3.5 h-3.5 shrink-0" />}
                              {evt.status === "Approved" && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                              {evt.status === "Rejected" && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.fromTime} - {evt.toTime}</span>
                            </div>
                            {evt.location && (
                              <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400"><MapPin className="w-3 h-3" /> {evt.location}</p>
                            )}
                            <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                              <UserCircle className="w-3 h-3" /> {evt.assignMode === "Group" ? `${evt.assignedGroup?.length || 0} Staff` : (evt.assignedUser || "Unassigned")}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => handleEdit(evt)} className="p-1.5 rounded-xl text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
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
