"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { loadVideoFromDB } from "@/lib/videoDB";
import {
  ArrowLeft, BookOpen, FileText, ImageIcon, Video,
  ListOrdered, HelpCircle, CheckCircle2, Circle, Users, Tag, FolderOpen,
  ChevronDown, ChevronUp
} from "lucide-react";

// ─── Same initial data as courses page (fallback for demo courses) ───────────
const DEMO_COURSES = [
  {
    id: 1, title: "Junior Medical Programs", code: "MED-101", status: "Active",
    colorScheme: "blue", designation: "Junior Resident (JR)",
    description: "For junior residents. Focus on fundamentals and core medical practices.",
    timeline: [
      { id: 1, type: "paragraph", data: "Welcome to Junior Medical Programs. This course covers the foundational aspects of medical practice in a hospital setting." },
      { id: 2, type: "mcq", data: { question: "What is the first step in patient assessment?", options: ["Check vitals", "Take history", "Primary survey", "Physical exam"], correct: 2 } },
      { id: 3, type: "paragraph", data: "After completing primary survey, always document your findings and communicate with your team lead." },
      { id: 4, type: "qa", data: { question: "When should you escalate a case to a senior consultant?", answer: "Whenever the patient's condition deteriorates rapidly or is beyond your scope of competence." } },
    ],
  },
  {
    id: 2, title: "Advanced Surgical Programs", code: "SUR-201", status: "Active",
    colorScheme: "teal", designation: "Senior Consultant",
    description: "For senior surgeons. Advanced techniques and competitive surgical procedures.",
    timeline: [
      { id: 1, type: "paragraph", data: "This module covers advanced laparoscopic and robotic surgical techniques." },
      { id: 2, type: "mcq", data: { question: "Which suture technique is preferred for bowel anastomosis?", options: ["Single layer", "Double layer", "Stapled", "All of the above"], correct: 3 } },
    ],
  },
  {
    id: 3, title: "Adult Care Programs", code: "NUR-100", status: "Draft",
    colorScheme: "emerald", designation: "Staff Nurse",
    description: "For nurses of all levels. From beginner to advanced patient care.",
    timeline: [
      { id: 1, type: "paragraph", data: "Patient care fundamentals include hygiene, mobility assistance, and medication administration." },
      { id: 2, type: "qa", data: { question: "How often should bedridden patients be repositioned?", answer: "Every 2 hours to prevent pressure ulcers." } },
    ],
  },
  {
    id: 4, title: "Emergency Protocols", code: "ER-500", status: "Active",
    colorScheme: "indigo", designation: "Medical Officer",
    description: "Critical response and life support for ER teams.",
    timeline: [
      { id: 1, type: "paragraph", data: "Emergency response begins with scene safety and calling for backup." },
      { id: 2, type: "mcq", data: { question: "ABCDE in trauma stands for?", options: ["Airway, Breathing, Circulation, Disability, Exposure", "Assess, Blood, Check, Diagnose, Evaluate", "Alert, Basic, Calm, Direct, Escalate", "None of the above"], correct: 0 } },
      { id: 3, type: "paragraph", data: "Document all interventions with precise timestamps for medico-legal purposes." },
    ],
  },
];

// ─── Progress Circle SVG ─────────────────────────────────────────────────────
function ProgressCircle({ percent, size = 120, stroke = 10, color = "#2563eb" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Content Block renderers ─────────────────────────────────────────────────
const TYPE_META = {
  section:   { icon: FolderOpen,  color: "blue",    label: "Section / Chapter" },
  paragraph: { icon: FileText,    color: "indigo",  label: "Paragraph" },
  image:     { icon: ImageIcon,   color: "teal",    label: "Image"     },
  video:     { icon: Video,       color: "purple",  label: "Video"     },
  mcq:       { icon: ListOrdered, color: "emerald", label: "MCQ Quiz"  },
  qa:        { icon: HelpCircle,  color: "rose",    label: "Q&A"       },
};

const BADGE = {
  blue:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  indigo:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  teal:    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  purple:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rose:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function ContentBlock({ item, index, isCompleted, onToggle }) {
  const meta = TYPE_META[item.type] || TYPE_META.paragraph;
  const Icon = meta.icon;
  const badge = BADGE[meta.color] || BADGE.blue;

  // Local state for MCQ selections
  const [selectedOption, setSelectedOption] = React.useState(null);
  // Resolved video src (handles IDB keys)
  const [videoSrc, setVideoSrc] = React.useState(null);

  // Reset selection if the item changes (e.g. going next/prev quickly)
  React.useEffect(() => {
    setSelectedOption(null);
  }, [item.id]);

  // Resolve video src: IDB key → object URL, or use as-is for http URLs
  React.useEffect(() => {
    if (item.type !== "video") return;
    const data = item.data;
    if (typeof data === "string" && data.startsWith("video_")) {
      loadVideoFromDB(data).then(url => setVideoSrc(url));
    } else {
      setVideoSrc(typeof data === "string" ? data : null);
    }
  }, [item.id, item.data]);

  return (
    <div className={`flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${isCompleted ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
      {/* Block Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge}`}>
            <Icon className="w-3 h-3 inline mr-1" />{meta.label}
          </span>
          <span className="text-xs font-semibold text-slate-400">Block {index + 1}</span>
        </div>
        <button onClick={onToggle} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 text-slate-500 hover:border-emerald-400 hover:text-emerald-600"}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isCompleted ? "Completed" : "Mark Done"}
        </button>
      </div>

      {/* Block Content */}
      <div className="flex-1 flex flex-col px-5 py-5 min-h-0">
        {item.type === "section" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/40">
            <FolderOpen className="w-16 h-16 text-blue-500 mb-4 opacity-60" />
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
              {typeof item.data === "string" ? item.data : "Section"}
            </h2>
          </div>
        )}

        {item.type === "paragraph" && (() => {
          // Support both old string format and new object format {heading, subheading, body}
          const isObj = typeof item.data === "object" && item.data !== null;
          const heading    = isObj ? item.data.heading    : null;
          const subheading = isObj ? item.data.subheading : null;
          const body       = isObj ? item.data.body       : (typeof item.data === "string" ? item.data : "");
          return (
            <div className="space-y-3">
              {heading && heading.trim() && (
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
                  {heading}
                </h2>
              )}
              {subheading && subheading.trim() && (
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 border-l-4 border-blue-400 pl-3">
                  {subheading}
                </p>
              )}
              {body && (
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {body}
                </p>
              )}
            </div>
          );
        })()}

        {item.type === "image" && (
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[320px] max-h-[60vh]">
            {typeof item.data === "string" && (item.data.startsWith("http") || item.data.startsWith("data:")) ? (
              <img src={item.data} alt="Course content" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">{typeof item.data?.name === "string" ? item.data.name : "Image content"}</p>
              </div>
            )}
          </div>
        )}

        {item.type === "video" && (() => {
          const src = videoSrc;
          const isBase64 = src?.startsWith("data:video");
          const isYouTube = src && (src.includes("youtube.com") || src.includes("youtu.be"));
          const isBlobOrHttp = src && (src.startsWith("blob:") || (src.startsWith("http") && !isYouTube));

          let ytEmbed = null;
          if (isYouTube) {
            const match = src.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (match) ytEmbed = `https://www.youtube.com/embed/${match[1]}`;
          }

          return (
            <div className="flex-1 rounded-xl overflow-hidden bg-slate-900 min-h-[320px] max-h-[60vh] w-full">
              {(isBase64 || isBlobOrHttp) && (
                <video src={src} controls className="w-full h-full" />
              )}
              {isYouTube && ytEmbed && (
                <iframe
                  src={ytEmbed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {!src && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No video available</p>
                </div>
              )}
            </div>
          );
        })()}

        {item.type === "mcq" && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-4">{item.data?.question}</p>
            {(item.data?.options || []).map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = item.data?.correct === i;
              const hasAnswered = selectedOption !== null;

              let stateClass = "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 cursor-pointer";
              let badgeClass = "bg-white dark:bg-slate-700 text-slate-500";

              if (isSelected) {
                if (isCorrect) {
                  stateClass = "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold z-10 relative shadow-sm";
                  badgeClass = "bg-emerald-500 text-white";
                } else {
                  stateClass = "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold z-10 relative shadow-sm";
                  badgeClass = "bg-red-500 text-white";
                }
              } else if (hasAnswered && isCorrect) {
                // Highlight the correct answer lightly if they selected the wrong one
                stateClass = "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 cursor-pointer";
                badgeClass = "bg-emerald-400 text-white";
              }

              return (
                <div
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${stateClass}`}
                >
                  <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all ${badgeClass}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {isCorrect && (isSelected || hasAnswered) && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {item.type === "qa" && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-xs font-bold uppercase text-blue-500 mb-1">Question</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.data?.question}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase text-slate-400 mb-1">Answer</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.data?.answer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CourseViewPage() {
  const router = useRouter();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState({}); // { blockId: true/false }
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    // Try localStorage first (published courses)
    const saved = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
    const allCourses = [...DEMO_COURSES, ...saved];
    const found = allCourses.find(c => String(c.id) === String(id));
    setCourse(found || null);

    // Load completion progress
    const progress = JSON.parse(localStorage.getItem(`course_progress_${id}`) || "{}");
    setCompleted(progress);
  }, [id]);

  const rawTimeline = course?.timeline || [];

  // Group into chapters and their items (supporting both nested structure and legacy flat structure)
  const structuredChapters = React.useMemo(() => {
    const chapters = [];
    let curChapter = null;
    let globalIndex = 0;

    rawTimeline.forEach(item => {
      if (item.type === "section") {
        curChapter = {
          id: item.id,
          type: "section",
          data: item.data,
          globalIndex: globalIndex++,
          items: []
        };
        chapters.push(curChapter);

        // If children array exists
        if (Array.isArray(item.children)) {
          item.children.forEach(child => {
            curChapter.items.push({
              ...child,
              globalIndex: globalIndex++,
              parentSection: item.data,
            });
          });
        }
      } else {
        if (curChapter && !Array.isArray(curChapter.items.find(c => c.id === item.id))) {
          curChapter.items.push({
            ...item,
            globalIndex: globalIndex++,
            parentSection: curChapter.data,
          });
        } else {
          // Top-level item without a preceding section
          chapters.push({
            id: item.id,
            type: item.type,
            data: item.data,
            globalIndex: globalIndex++,
            isStandAlone: true,
          });
        }
      }
    });

    return chapters;
  }, [rawTimeline]);

  // Flattened array for pagination & active item display
  const flattenedTimeline = React.useMemo(() => {
    const list = [];
    structuredChapters.forEach(group => {
      if (group.type === "section") {
        list.push({ id: group.id, type: group.type, data: group.data });
        (group.items || []).forEach(child => list.push(child));
      } else {
        list.push(group);
      }
    });
    return list;
  }, [structuredChapters]);

  // Auto-expand all chapters initially
  useEffect(() => {
    const exp = {};
    structuredChapters.forEach(g => {
      if (g.type === "section") exp[g.id] = true;
    });
    setExpandedSections(exp);
  }, [structuredChapters]);

  const toggleComplete = (blockId) => {
    const updated = { ...completed, [blockId]: !completed[blockId] };
    setCompleted(updated);
    localStorage.setItem(`course_progress_${id}`, JSON.stringify(updated));
  };

  const toggleSection = (secId) => {
    setExpandedSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">Course not found.</p>
          <button onClick={() => router.back()} className="mt-3 text-sm font-bold text-blue-600 hover:underline">← Go back</button>
        </div>
      </div>
    );
  }



  const total = flattenedTimeline.length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const PROGRESS_COLOR = percent === 100 ? "#10b981" : percent > 50 ? "#2563eb" : "#f59e0b";
  const currentItem = flattenedTimeline[currentModuleIndex];

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden space-y-6 bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">

      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title={course.title} description={course.description} />
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0 overflow-hidden">

        {/* ── LEFT: Content Blocks */}
        <div className="xl:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> Course Module {total > 0 ? `${currentModuleIndex + 1} of ${total}` : ""}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-4 themed-scroll bg-slate-50/30 dark:bg-slate-900/30">
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-semibold text-sm">No content blocks in this course yet.</p>
              </div>
            ) : (
              <div className="flex-1 h-full">
                {currentItem && (
                  <ContentBlock
                    key={currentItem.id}
                    item={currentItem}
                    index={currentModuleIndex}
                    isCompleted={!!completed[currentItem.id]}
                    onToggle={() => toggleComplete(currentItem.id)}
                  />
                )}
              </div>
            )}

            {/* Pagination Buttons */}
            {total > 0 && (
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 max-w-4xl mx-auto w-full">
                <button
                  onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentModuleIndex === 0}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentModuleIndex === 0 ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:text-blue-600 shadow-sm"}`}
                >
                  Previous
                </button>

                <span className="text-xs font-semibold text-slate-400">
                  {currentModuleIndex + 1} / {total}
                </span>

                <button
                  onClick={() => setCurrentModuleIndex(prev => Math.min(total - 1, prev + 1))}
                  disabled={currentModuleIndex === total - 1}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentModuleIndex === total - 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"}`}
                >
                  Next Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Progress Sidebar */}
        <div className="xl:col-span-1 overflow-y-auto themed-scroll pr-1 flex flex-col gap-4">

          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 p-6 flex flex-col items-center text-center shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4">Course Progress</h3>

            {/* Circular Progress */}
            <div className="relative inline-flex items-center justify-center">
              <ProgressCircle percent={percent} size={130} stroke={12} color={PROGRESS_COLOR} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 dark:text-white">{percent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complete</span>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {doneCount} of {total} blocks done
            </p>

            {percent === 100 && (
              <div className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" /> Completed!
              </div>
            )}
          </div>

          {/* Course Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 p-5 space-y-4 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Course Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Tag className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Code</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{course.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Target</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{course.designation || "All Staff"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Blocks</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{total} content blocks</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Circle className="w-4 h-4 shrink-0" style={{ color: course.status === "Active" ? "#10b981" : "#f59e0b" }} />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className={`font-bold ${course.status === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{course.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Block Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 p-5 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Content Checklist</h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {doneCount}/{total} done
              </span>
            </div>

            <div className="space-y-2.5">
              {structuredChapters.map((group, gIdx) => {
                // If it's a section / chapter container with dropdown
                if (group.type === "section") {
                  const isExpanded = !!expandedSections[group.id];
                  const childItems = group.items || [];
                  const isSectionActive = currentModuleIndex === group.globalIndex;
                  const isSectionDone = !!completed[group.id];
                  const sectionCompletedCount = childItems.filter(c => !!completed[c.id]).length;

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 transition-all"
                    >
                      {/* Chapter Dropdown Header */}
                      <div
                        onClick={() => toggleSection(group.id)}
                        className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors select-none"
                      >
                        {/* Checkbox for section completion itself */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(group.id);
                          }}
                          title="Mark Section Done"
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
                            isSectionDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                          }`}
                        >
                          {isSectionDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>

                        {/* Title and click to view section intro */}
                        <div
                          className="flex-1 min-w-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentModuleIndex(group.globalIndex);
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              Chapter
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {childItems.length} {childItems.length === 1 ? "item" : "items"}
                            </span>
                            {childItems.length > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ({sectionCompletedCount}/{childItems.length})
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold block truncate mt-0.5 hover:text-blue-600 transition-colors ${
                              isSectionActive ? "text-blue-600 dark:text-blue-400 underline font-extrabold" : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {typeof group.data === "string" ? group.data : "Chapter"}
                          </span>
                        </div>

                        {/* Chevron dropdown icon */}
                        <div className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Dropdown Body: Nested Chapter Content items */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-2 space-y-1.5">
                          {childItems.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic px-2 py-1 text-center">
                              No items in this chapter
                            </p>
                          ) : (
                            childItems.map((child) => {
                              const meta = TYPE_META[child.type] || TYPE_META.paragraph;
                              const isChildActive = currentModuleIndex === child.globalIndex;
                              const isChildDone = !!completed[child.id];

                              return (
                                <div
                                  key={child.id}
                                  onClick={() => setCurrentModuleIndex(child.globalIndex)}
                                  className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                                    isChildActive
                                      ? "ring-2 ring-blue-500/40 bg-blue-50 dark:bg-blue-900/30"
                                      : isChildDone
                                      ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                  }`}
                                >
                                  {/* Child Checkbox */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleComplete(child.id);
                                    }}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
                                      isChildDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                                    }`}
                                  >
                                    {isChildDone && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                                        {meta.label}
                                      </span>
                                    </div>
                                    <p className={`text-[10px] truncate ${isChildDone ? "line-through text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                                      {typeof child.data === "object" && child.data !== null
                                        ? (child.data.heading || child.data.question || child.data.body || "Item content")
                                        : (typeof child.data === "string" ? child.data : "Content block")}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Standalone top-level item without a section
                const meta = TYPE_META[group.type] || TYPE_META.paragraph;
                const isItemActive = currentModuleIndex === group.globalIndex;
                const isItemDone = !!completed[group.id];

                return (
                  <div
                    key={group.id}
                    onClick={() => setCurrentModuleIndex(group.globalIndex)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                      isItemActive
                        ? "ring-2 ring-blue-500/40 bg-blue-50/70 dark:bg-blue-900/30"
                        : isItemDone
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(group.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
                        isItemDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isItemDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold block truncate ${isItemDone ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-slate-600 dark:text-slate-400"}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
