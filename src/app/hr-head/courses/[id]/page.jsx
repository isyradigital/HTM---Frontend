"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { loadVideoFromDB } from "@/lib/videoDB";
import { updateStaffCourseProgress, enrollStaffInCourse, getEnrollments } from "@/lib/enrollmentService";
import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft, BookOpen, FileText, ImageIcon, Video,
  ListOrdered, HelpCircle, CheckCircle2, Circle, Users, Tag, FolderOpen,
  ChevronDown, ChevronUp, Lock, Sparkles, GraduationCap, Award, ShieldCheck, AlertCircle, Clock, ExternalLink
} from "lucide-react";
import { getCertifications, createCertification } from "@/lib/certificationService";

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
function ProgressCircle({ percent, size = 120, stroke = 10, color = "#8b5cf6" }) {
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
  const pathname = usePathname();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [activeUser, setActiveUser] = useState({ id: "hr_head", role: "hr-head", name: "HR Head", department: "Administration", designation: "HR Head" });
  const [completed, setCompleted] = useState({}); // { blockId: true/false }
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(true);
  const toast = useToast();

  // Detect current active user based on URL and current_standard_user localStorage
  useEffect(() => {
    let user = { id: "hr_head", role: "hr-head", name: "HR Head", department: "Administration", designation: "HR Head" };
    if (pathname?.startsWith("/user")) {
      try {
        const saved = localStorage.getItem("current_standard_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          user = { 
            id: parsed.id || "WF001", 
            role: "user", 
            name: parsed.name || "Dr. Rajesh Sharma",
            department: parsed.department || "Cardiology",
            designation: parsed.designation || "Senior Consultant"
          };
        } else {
          user = { 
            id: "WF001", 
            role: "user", 
            name: "Dr. Rajesh Sharma",
            department: "Cardiology",
            designation: "Senior Consultant"
          };
        }
      } catch (e) {
        user = { 
          id: "WF001", 
          role: "user", 
          name: "Dr. Rajesh Sharma",
          department: "Cardiology",
          designation: "Senior Consultant"
        };
      }
    } else if (pathname?.startsWith("/dept-head")) {
      user = { id: "dept_head_icu", role: "dept-head", name: "Sarah Jenkins", department: "ICU", designation: "Dept Head (ICU)" };
    }
    setActiveUser(user);

    // Try localStorage first (published courses)
    const savedCourses = JSON.parse(localStorage.getItem("hospital_courses") || "[]");
    const allCourses = [...DEMO_COURSES, ...savedCourses];
    const found = allCourses.find(c => String(c.id) === String(id));
    setCourse(found || null);

    // Check if user is enrolled (HR Head & Dept Head are always considered enrolled/unlocked)
    if (user.role === "user") {
      const allEnrollments = getEnrollments();
      const userEnrolled = allEnrollments.some(
        e => String(e.courseId) === String(id) && e.staffId === user.id
      );
      setIsEnrolled(userEnrolled);
    } else {
      setIsEnrolled(true);
    }

    // Load completion progress specifically for this active user
    const userProgressKey = `course_progress_${user.id}_${id}`;
    const progress = JSON.parse(localStorage.getItem(userProgressKey) || "{}");
    setCompleted(progress);
  }, [id, pathname]);

  const handleEnrollCourse = () => {
    if (!course) return;
    const res = enrollStaffInCourse({
      courseId: course.id,
      courseTitle: course.title,
      staff: {
        id: activeUser.id,
        name: activeUser.name,
        department: activeUser.department || "Medical Department",
        designation: activeUser.designation || "Staff Member"
      },
      totalModules: flattenedTimeline.length || 4
    });

    if (res.success || res.message?.includes("already enrolled")) {
      setIsEnrolled(true);
      toast.success(`You are now enrolled in "${course.title}". All features are unlocked!`, {
        title: "Enrolled Successfully"
      });
      // Fire event so other components refresh live
      window.dispatchEvent(new Event("storage"));
    } else {
      toast.error(res.message, { title: "Enrollment Failed" });
    }
  };

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

    // Save to user-specific progress key
    const userProgressKey = `course_progress_${activeUser.id}_${id}`;
    localStorage.setItem(userProgressKey, JSON.stringify(updated));

    // Also update central enrollment progress for standard staff users
    if (activeUser.role === "user" && activeUser.id) {
      const completedCount = Object.values(updated).filter(Boolean).length;
      updateStaffCourseProgress({
        courseId: id,
        staffId: activeUser.id,
        completedModules: completedCount,
        totalModules: flattenedTimeline.length || 1,
      });
    }
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

  // ── Enrollment Gate: Standard users who haven't enrolled see a locked screen ──
  if (activeUser.role === "user" && !isEnrolled) {
    return (
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-transparent p-4 md:p-6">
        {/* Header */}
        <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <PageHeader title={course.title} description={course.description} />
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Locked Content Preview */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Blurred background preview */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 dark:from-slate-900 dark:via-blue-950/30 dark:to-blue-950/20 opacity-60" />
            <div className="absolute inset-0 backdrop-blur-sm" />
          </div>

          {/* Lock Gate Card */}
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-blue-500/10 p-10 md:p-14 max-w-lg w-full mx-4 flex flex-col items-center text-center gap-6">
            {/* Lock Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Lock className="w-9 h-9 text-white" />
            </div>

            {/* Course Badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800/50">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{course.code}</span>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Enroll to Access This Course
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                This course content is locked. Enroll in the program to unlock all modules, track your progress, and get certified.
              </p>
            </div>

            {/* Course Stats Row */}
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">{flattenedTimeline.length || "—"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Modules</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">{course.status}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Status</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center">
                <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{course.designation || "All Staff"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Target</p>
              </div>
            </div>

            {/* Enroll Button */}
            <button
              onClick={handleEnrollCourse}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              Enroll Program
            </button>

            <p className="text-[11px] font-medium text-slate-400">
              Enrolling as <span className="font-bold text-slate-600 dark:text-slate-300">{activeUser.name}</span> · {activeUser.department}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const total = flattenedTimeline.length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const PROGRESS_COLOR = percent === 100 ? "#7c3aed" : percent > 50 ? "#8b5cf6" : "#f59e0b";
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
              <div className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl text-blue-700 dark:text-blue-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Completed!
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
                <Circle className={`w-4 h-4 shrink-0 ${course.status === "Active" ? "text-blue-500" : "text-amber-500"}`} />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className={`font-bold ${course.status === "Active" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>{course.status}</p>
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
                            isSectionDone ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
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
                              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
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
                                      ? "bg-blue-50/60 dark:bg-blue-900/20"
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
                                      isChildDone ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
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
                        ? "bg-blue-50/60 dark:bg-blue-900/20"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(group.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
                        isItemDone ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {isItemDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold block truncate ${isItemDone ? "text-blue-600 dark:text-blue-400 line-through" : "text-slate-600 dark:text-slate-400"}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Certificate Section (Connected to Course & Linked Certificates) ── */}
          {(() => {
            // Find linked certificate details
            const allCerts = getCertifications();
            const linkedCertIds = course?.certificateIds || (course?.certificateId ? [course.certificateId] : []);
            const linkedCerts = allCerts.filter(c => linkedCertIds.includes(c.id));
            
            // Check if user already applied or has this certificate
            const userCertificate = allCerts.find(c => 
              (String(c.courseId) === String(course?.id) || (c.courseTitle && course?.title && c.courseTitle.toLowerCase() === course.title.toLowerCase())) &&
              (c.staffId === activeUser.id || (c.staffName && c.staffName.toLowerCase() === activeUser.name?.toLowerCase()))
            );

            const isPendingApproval = userCertificate && (!userCertificate.approvalStatus || userCertificate.approvalStatus === "Pending");
            const isApproved = userCertificate && userCertificate.approvalStatus === "Approved";
            const canApply = percent === 100 && !userCertificate;

            const handleApplyForCertificate = () => {
              if (percent < 100) {
                toast.warning("Please complete all course modules first.", { title: "Course Incomplete" });
                return;
              }

              // Create certification request in pending approval state for HR/Dept Head
              const baseCert = linkedCerts[0] || {};
              const todayStr = new Date().toISOString().split("T")[0];
              
              // Calculate 1 Year default expiry
              const expDate = new Date();
              expDate.setFullYear(expDate.getFullYear() + 1);
              const expDateStr = expDate.toISOString().split("T")[0];

              const newCert = createCertification({
                courseId: course.id,
                courseTitle: course.title,
                courseCode: course.code || "MED-101",
                staffId: activeUser.id,
                staffName: activeUser.name,
                department: activeUser.department || "Cardiology",
                designation: activeUser.designation || "Senior Consultant",
                category: course.designation || "Clinical Competency",
                validity: baseCert.validity || "1 Year",
                validitySubtext: `Issued ${todayStr}`,
                issueDate: todayStr,
                expiryDate: baseCert.expiryDate || expDateStr,
                footnote: `Valid until ${baseCert.expiryDate || expDateStr}`,
                description: `Hospital accredited qualification in "${course.title}" completed and submitted for clinical compliance approval.`,
                features: [
                  `Course Completion: ${course.title} (${course.code || "MED"})`,
                  `Recipient: ${activeUser.name} (${activeUser.designation})`,
                  `Clinical Department: ${activeUser.department}`,
                  "Hospital Protocol Compliance Passed"
                ],
                status: "Pending",
                approvalStatus: "Pending",
                appliedAt: todayStr,
                isCourseCompletionRequest: true,
                template: baseCert.template || "classic"
              });

              toast.success(`Application submitted! HR Head has been notified in Certificate Tracker under Approvals.`, {
                title: "Certificate Applied"
              });

              // Dispatch event to sync state across views
              window.dispatchEvent(new Event("storage"));
            };

            return (
              <div className={`rounded-[2rem] border shadow-lg p-5 shrink-0 transition-all duration-500 ${
                isApproved
                  ? "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/50 shadow-emerald-500/10"
                  : canApply
                  ? "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 border-blue-200 dark:border-blue-800/50 shadow-blue-500/10"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-blue-500/5"
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between gap-2.5 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isApproved
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                        : canApply
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                        Accredited Certificate
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Upon Completion
                      </p>
                    </div>
                  </div>

                  {isApproved ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Approved & Issued
                    </span>
                  ) : isPendingApproval ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Pending Approval
                    </span>
                  ) : null}
                </div>

                {/* Linked Certificate Name & Details */}
                <div className={`p-3 rounded-xl border mb-3 transition-colors ${
                  isApproved
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                    : canApply
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-80"
                }`}>
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {linkedCerts.length > 0 ? linkedCerts.map(c => c.courseTitle).join(", ") : `${course?.title} Qualification Certificate`}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Awarded to: <strong className="text-slate-700 dark:text-slate-300">{activeUser.name}</strong> ({activeUser.designation})
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Progress</span>
                    <span className={`text-[11px] font-black ${percent === 100 ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 bg-blue-600" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                {/* Action Buttons based on state */}
                {isApproved ? (
                  <button
                    type="button"
                    onClick={() => router.push("/user/certification")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> View Your Certificate
                  </button>
                ) : isPendingApproval ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
                      <Clock className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                      <span>Request sent to HR. Awaiting certificate approval.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/user/certification")}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Check Certification Page
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      disabled={!canApply}
                      onClick={handleApplyForCertificate}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                        canApply
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {canApply ? (
                        <><Award className="w-4 h-4" /> Apply for Certificate</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Apply for Certificate</>
                      )}
                    </button>
                    {!canApply && (
                      <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                        Complete all {total} modules to enable application
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
