"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { initialCourses } from "../page";
import { saveVideoToDB } from "@/lib/videoDB";
import { PageHeader } from "@/components/PageHeader";
import {
  ArrowLeft, FileText, ImageIcon, Video, HelpCircle, ListOrdered,
  GripVertical, Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown,
  BookOpen, Users, AlignLeft, Image as Img, FolderOpen
} from "lucide-react";

const DESIGNATIONS = [
  "All Designations", "Senior Consultant", "Medical Officer",
  "Senior Resident (SR)", "Junior Resident (JR)", "Senior Nurse", "Staff Nurse"
];

const CONTENT_TYPES = [
  { id: "section", label: "Section / Chapter", icon: FolderOpen, color: "orange" },
  { id: "paragraph", label: "Paragraph", icon: AlignLeft, color: "blue" },
  { id: "image", label: "Image / Banner", icon: Img, color: "teal" },
  { id: "video", label: "Video", icon: Video, color: "indigo" },
  { id: "mcq", label: "MCQ Quiz", icon: ListOrdered, color: "emerald" },
  { id: "qa", label: "Q&A", icon: HelpCircle, color: "rose" },
];

const COLOR_MAP = {
  orange: { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  blue: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  teal: { badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  indigo: { badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  emerald: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  rose: { badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

// ── MCQ Sub-component ────────────────────────────────────────────────────────
function McqBuilder({ value, onChange }) {
  const [options, setOptions] = useState(["", ""]);
  const [correctIdx, setCorrectIdx] = useState(null);

  const update = (newQ, newOpts, newCorrect) => {
    onChange({ question: newQ ?? value?.question ?? "", options: newOpts ?? options, correct: newCorrect ?? correctIdx });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Enter MCQ Question…"
        value={value?.question ?? ""}
        onChange={e => update(e.target.value, null, null)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
      />
      <div className="space-y-2 pl-2">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Select the circle next to the correct option
        </p>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              title="Mark as correct answer"
              onClick={() => { setCorrectIdx(i); update(null, null, i); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 shrink-0 transition-all ${correctIdx === i ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"}`}
            >
              {correctIdx === i && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <input
              type="text"
              value={opt}
              onChange={e => {
                const upd = [...options]; upd[i] = e.target.value;
                setOptions(upd); update(null, upd, null);
              }}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
            />
            {options.length > 2 && (
              <button type="button" onClick={() => {
                const upd = options.filter((_, idx) => idx !== i);
                setOptions(upd); update(null, upd, null);
              }} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => { const upd = [...options, ""]; setOptions(upd); update(null, upd, null); }}
          className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
          <Plus className="w-3 h-3" /> Add Option
        </button>
      </div>
    </div>
  );
}

// ── Q&A Sub-component ────────────────────────────────────────────────────────
function QABuilder({ value, onChange }) {
  return (
    <div className="space-y-3">
      <input type="text" placeholder="Enter Question…" value={value?.question ?? ""} onChange={e => onChange({ ...value, question: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-medium" />
      <textarea placeholder="Enter expected Answer…" rows={3} value={value?.answer ?? ""} onChange={e => onChange({ ...value, answer: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none resize-none focus:ring-2 focus:ring-rose-500/20 text-sm font-medium" />
    </div>
  );
}

// ── Timeline Item Component ──────────────────────────────────────────────────
function TimelineItem({ item, index, total, onRemove, onMoveUp, onMoveDown, isSelected, onSelect }) {
  const typeInfo = CONTENT_TYPES.find(t => t.id === item.type);
  const color = COLOR_MAP[typeInfo?.color] || COLOR_MAP.blue;

  const getPreview = () => {
    if (item.type === "section") return (typeof item.data === "string" ? item.data : "Section");
    if (item.type === "paragraph") {
      if (typeof item.data === "object" && item.data !== null) {
        return item.data.heading || item.data.body || "Paragraph block";
      }
      return (typeof item.data === "string" ? item.data : "") || "—";
    }
    if (item.type === "image") return (typeof item.data === "string" ? (item.data.startsWith("data:") ? "Image uploaded ✓" : item.data) : (item.data?.name || "Image uploaded"));
    if (item.type === "video") return (typeof item.data === "string" ? item.data : (item.data?.name || "Video uploaded"));
    if (item.type === "mcq") return (typeof item.data?.question === "string" ? item.data.question : "MCQ Question") || "MCQ Question";
    if (item.type === "qa") return (typeof item.data?.question === "string" ? item.data.question : "Q&A Question") || "Q&A Question";
    return "—";
  };

  return (
    <div onClick={onSelect} className={`group relative flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300"}`}>
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-1">
        <button type="button" disabled={index === 0} onClick={e => { e.stopPropagation(); onMoveUp(); }} className="p-0.5 disabled:opacity-20 text-slate-400 hover:text-blue-500 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
        <GripVertical className="w-3.5 h-3.5 text-slate-300" />
        <button type="button" disabled={index === total - 1} onClick={e => { e.stopPropagation(); onMoveDown(); }} className="p-0.5 disabled:opacity-20 text-slate-400 hover:text-blue-500 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.badge}`}>{typeInfo?.label}</span>
          <span className="text-[10px] text-slate-400">#{index + 1}</span>
        </div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{getPreview()}</p>
      </div>
      <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Tabs
  const [activeTab, setActiveTab] = useState("details");

  // Course Details
  const [courseDetails, setCourseDetails] = useState({ title: "", code: "", designation: "", description: "" });

  // Content Builder
  const [contentType, setContentType] = useState("paragraph");
  const [currentData, setCurrentData] = useState(null);

  // Timeline
  const [timeline, setTimeline] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    if (editId) {
      const saved = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
      const allCourses = [...initialCourses, ...saved];
      const found = allCourses.find(c => String(c.id) === editId);
      if (found) {
        setCourseDetails({
          title: found.title || "",
          code: found.code || "",
          designation: found.designation || "",
          description: found.description || "",
        });
        setTimeline(found.timeline || []);
      }
    }
  }, [editId]);

  const handleAddContent = () => {
    const isEmpty =
      !currentData ||
      (typeof currentData === "string" && !currentData.trim()) ||
      (typeof currentData === "object" && !currentData.body?.trim() && !currentData.question?.trim() && !currentData.name) ||
      (currentData instanceof File === false && typeof currentData === "object" && Object.keys(currentData).length === 0);
    if (isEmpty) return alert("Please add content before adding to timeline.");

    setTimeline(prev => [...prev, { id: Date.now(), type: contentType, data: currentData }]);
    setCurrentData(null);
  };

  const removeItem = (id) => setTimeline(prev => prev.filter(t => t.id !== id));

  const moveItem = (idx, dir) => {
    setTimeline(prev => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    setSelectedIdx(idx + dir);
  };

  const saveCourse = async () => {
    if (!courseDetails.title) return alert("Please enter a course title.");
    if (timeline.length === 0) return alert("Please add at least one content block.");

    // Process timeline: save base64 videos to IndexedDB, store only the key
    const processedTimeline = await Promise.all(
      timeline.map(async (item) => {
        if (item.type === "video" && typeof item.data === "string" && item.data.startsWith("data:video")) {
          const videoKey = await saveVideoToDB(item.data);
          return { ...item, data: videoKey }; // store IDB key instead of base64
        }
        return item;
      })
    );

    const schemes = ["blue", "teal", "emerald", "indigo"];
    const newCourse = {
      id: editId ? Number(editId) : Date.now(),
      title: courseDetails.title,
      code: courseDetails.code || "N/A",
      designation: courseDetails.designation || "All Designations",
      description: courseDetails.description,
      status: "Active",
      colorScheme: schemes[Math.floor(Math.random() * schemes.length)],
      timeline: processedTimeline,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
      if (editId) {
        const updated = existing.filter(c => String(c.id) !== editId);
        updated.push(newCourse);
        localStorage.setItem("hospital_courses", JSON.stringify(updated));
        const deletedDemo = JSON.parse(localStorage.getItem("deleted_demo_courses") || "[]");
        if (!deletedDemo.includes(Number(editId))) {
          deletedDemo.push(Number(editId));
          localStorage.setItem("deleted_demo_courses", JSON.stringify(deletedDemo));
        }
      } else {
        localStorage.setItem("hospital_courses", JSON.stringify([...existing, newCourse]));
      }
    } catch (e) {
      alert("Storage quota exceeded even after video optimization. Please remove some large images.");
      return;
    }

    window.dispatchEvent(new Event("storage"));
    alert(editId ? "Course Updated Successfully!" : "Course Published Successfully!");
    router.push("/hr-head/courses");
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">

      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Create New Course"
          description="Build a training module by filling details and assembling content blocks."
        />
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">

        {/* ── LEFT: Form + Content Builder (3 cols) */}
        <div className="xl:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">

          {/* Tab Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm w-full max-w-sm">
              <button onClick={() => setActiveTab("details")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === "details" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <BookOpen className="w-3.5 h-3.5" /> Course Details
              </button>
              <button onClick={() => setActiveTab("content")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === "content" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <Plus className="w-3.5 h-3.5" /> Add Content
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 themed-scroll">

            {/* ──────────── DETAILS TAB ──────────── */}
            {activeTab === "details" && (
              <div className="space-y-6 max-w-2xl">
                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Course Title *</label>
                  <input type="text" value={courseDetails.title}
                    onChange={e => setCourseDetails({ ...courseDetails, title: e.target.value })}
                    placeholder="e.g. Basic Life Support (BLS)"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                </div>

                {/* Course Code */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Course Code</label>
                  <input type="text" value={courseDetails.code}
                    onChange={e => setCourseDetails({ ...courseDetails, code: e.target.value })}
                    placeholder="e.g. MED-101"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" />
                </div>

                {/* Target Designation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Designation</label>
                  <div className="flex flex-wrap gap-2">
                    {DESIGNATIONS.map(d => (
                      <button key={d} type="button"
                        onClick={() => setCourseDetails({ ...courseDetails, designation: d })}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${courseDetails.designation === d ? "bg-blue-600 border-blue-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                  <textarea value={courseDetails.description} rows={4}
                    onChange={e => setCourseDetails({ ...courseDetails, description: e.target.value })}
                    placeholder="Brief description of the course objectives and outcomes…"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium" />
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Course Banner Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 transition-all cursor-pointer group">
                    <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                    <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-500">Click to upload banner</span>
                    <span className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>

                <button onClick={() => setActiveTab("content")}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                  Next: Add Content <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ──────────── CONTENT BUILDER TAB ──────────── */}
            {activeTab === "content" && (
              <div className="space-y-6 max-w-2xl">

                {/* Content Type Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">Select Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(type => {
                      const isActive = contentType === type.id;
                      const col = COLOR_MAP[type.color];
                      return (
                        <button key={type.id}
                          onClick={() => { setContentType(type.id); setCurrentData(null); }}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${isActive ? `${col.badge} border-transparent shadow-sm` : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                          <type.icon className="w-4 h-4" /> {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Input */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  {contentType === "section" && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                        Section Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 1: Introduction"
                        value={typeof currentData === "string" ? currentData : ""}
                        onChange={e => setCurrentData(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                      />
                    </div>
                  )}

                  {contentType === "paragraph" && (
                    <div className="space-y-3">
                      {/* Optional Heading */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                          Heading <span className="text-slate-300 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Introduction to Patient Care"
                          value={typeof currentData === "object" ? (currentData?.heading ?? "") : ""}
                          onChange={e => setCurrentData(prev => ({ ...(typeof prev === "object" && prev !== null ? prev : {}), heading: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                        />
                      </div>
                      {/* Optional Sub-heading */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                          Sub-heading <span className="text-slate-300 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Key concepts and learning objectives"
                          value={typeof currentData === "object" ? (currentData?.subheading ?? "") : ""}
                          onChange={e => setCurrentData(prev => ({ ...(typeof prev === "object" && prev !== null ? prev : {}), subheading: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                        />
                      </div>
                      {/* Body Text */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                          Content Body <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={typeof currentData === "object" ? (currentData?.body ?? "") : (typeof currentData === "string" ? currentData : "")}
                          onChange={e => setCurrentData(prev => ({ ...(typeof prev === "object" && prev !== null ? prev : {}), body: e.target.value }))}
                          placeholder="Type your paragraph content here…"
                          rows={6}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === "image" && (
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-teal-400 transition-all cursor-pointer group">
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-teal-400 transition-colors mb-2" />
                        <span className="text-sm font-semibold text-slate-500 group-hover:text-teal-500">Upload Image</span>
                        <span className="text-xs text-slate-400 mt-0.5">PNG, JPG, GIF up to 10MB</span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => setCurrentData(evt.target.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                      </label>
                      {currentData && <p className="text-xs font-semibold text-teal-600 text-center">✓ Image attached</p>}
                    </div>
                  )}

                  {contentType === "video" && (
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer group">
                        <Video className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                        <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-500">Upload Video</span>
                        <span className="text-xs text-slate-400 mt-0.5">MP4, MOV up to 500MB</span>
                        <input type="file" accept="video/*" className="hidden"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => setCurrentData(evt.target.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                      </label>
                      {currentData && typeof currentData === "string" && currentData.startsWith("data:") && (
                        <p className="text-xs font-semibold text-indigo-600 text-center">✓ Video attached</p>
                      )}
                      <div className="text-center text-xs text-slate-400 font-semibold">— or paste a YouTube / video URL —</div>
                      <input type="url" placeholder="https://youtube.com/…" value={typeof currentData === "string" && !currentData.startsWith("data:") ? currentData : ""}
                        onChange={e => setCurrentData(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm" />
                    </div>
                  )}

                  {contentType === "mcq" && (
                    <McqBuilder value={currentData} onChange={setCurrentData} />
                  )}

                  {contentType === "qa" && (
                    <QABuilder value={currentData} onChange={setCurrentData} />
                  )}

                  <div className="flex justify-end pt-2">
                    <button onClick={handleAddContent}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                      <Plus className="w-4 h-4" /> Add to Timeline
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: Timeline (1 col) */}
        <div className="xl:col-span-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">

          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-500" /> Course Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{timeline.length} content block{timeline.length !== 1 ? "s" : ""} added</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 themed-scroll">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-12 opacity-60">
                <ListOrdered className="w-10 h-10 mb-3" />
                <p className="text-xs font-semibold text-center leading-relaxed">Timeline is empty.<br />Add content blocks from the builder.</p>
              </div>
            ) : (
              timeline.map((item, idx) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  index={idx}
                  total={timeline.length}
                  isSelected={selectedIdx === idx}
                  onSelect={() => setSelectedIdx(idx)}
                  onRemove={() => removeItem(item.id)}
                  onMoveUp={() => moveItem(idx, -1)}
                  onMoveDown={() => moveItem(idx, 1)}
                />
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button onClick={saveCourse}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${timeline.length > 0 && courseDetails.title ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:-translate-y-0.5" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
              <CheckCircle2 className="w-4 h-4" /> Publish Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
