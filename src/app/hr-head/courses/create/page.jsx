"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { initialCourses } from "../page";
import { saveVideoToDB } from "@/lib/videoDB";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft, FileText, ImageIcon, Video, HelpCircle, ListOrdered,
  GripVertical, Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown,
  BookOpen, Users, AlignLeft, Image as Img, FolderOpen, Award, Check, ExternalLink, ShieldCheck
} from "lucide-react";
import { getCertifications } from "@/lib/certificationService";

const DESIGNATIONS = [
  "All Designations", "Senior Consultant", "Medical Officer",
  "Senior Resident (SR)", "Junior Resident (JR)", "Senior Nurse", "Staff Nurse"
];

const CONTENT_TYPES = [
  { id: "section", label: "Section / Chapter", icon: FolderOpen, color: "blue" },
  { id: "paragraph", label: "Paragraph", icon: AlignLeft, color: "indigo" },
  { id: "image", label: "Image / Banner", icon: Img, color: "teal" },
  { id: "video", label: "Video", icon: Video, color: "purple" },
  { id: "mcq", label: "MCQ Quiz", icon: ListOrdered, color: "emerald" },
  { id: "qa", label: "Q&A", icon: HelpCircle, color: "rose" },
];

const COLOR_MAP = {
  blue: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  indigo: { badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  teal: { badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  purple: { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
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

// ── Section Accordion Item Component ─────────────────────────────────────────
function SectionAccordionItem({
  section,
  index,
  totalSections,
  isExpanded,
  onToggleExpand,
  isActiveSection,
  onSetActiveSection,
  onRemoveSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onRemoveChild,
  onMoveChildUp,
  onMoveChildDown,
  selectedId,
  onSelectId,
}) {
  const children = section.children || [];
  const sectionTitle = typeof section.data === "string" ? section.data : "Section";

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isActiveSection
          ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
      }`}
    >
      {/* Chapter Header */}
      <div
        onClick={onToggleExpand}
        className={`group relative flex items-center gap-2 p-3 cursor-pointer select-none transition-colors ${
          isActiveSection
            ? "hover:bg-blue-50/70 dark:hover:bg-blue-900/30"
            : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
        }`}
      >
        {/* Reorder Section buttons */}
        <div className="flex flex-col items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveSectionUp}
            className="p-0.5 disabled:opacity-20 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <GripVertical className="w-3.5 h-3.5 text-slate-300" />
          <button
            type="button"
            disabled={index === totalSections - 1}
            onClick={onMoveSectionDown}
            className="p-0.5 disabled:opacity-20 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section title & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Section / Chapter
            </span>
            <span className="text-[10px] font-semibold text-slate-400">#{index + 1}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {children.length} {children.length === 1 ? "item" : "items"}
            </span>
            {isActiveSection && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                Active target
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {sectionTitle}
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            title={isActiveSection ? "Currently active for adding new content" : "Target this chapter for adding content"}
            onClick={onSetActiveSection}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
              isActiveSection
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {isActiveSection ? "Selected" : "Add into"}
          </button>

          <button
            type="button"
            title="Delete Chapter"
            onClick={onRemoveSection}
            className="p-1 text-slate-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Accordion Chevron */}
          <div className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Nested Children (Dropdown / Accordion Body) */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 space-y-2">
          {children.length === 0 ? (
            <div className="py-4 text-center text-[11px] font-medium text-slate-400 italic">
              No content yet in this chapter.<br />
              Select content type & click &quot;Add to Timeline&quot;.
            </div>
          ) : (
            children.map((child, cIdx) => (
              <TimelineItem
                key={child.id}
                item={child}
                index={cIdx}
                total={children.length}
                isSelected={selectedId === child.id}
                onSelect={() => onSelectId(child.id)}
                onRemove={() => onRemoveChild(child.id)}
                onMoveUp={() => onMoveChildUp(cIdx)}
                onMoveDown={() => onMoveChildDown(cIdx)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Content ─────────────────────────────────────────────────────────────
function CreateCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const toast = useToast();

  // Tabs
  const [activeTab, setActiveTab] = useState("details");

  // Course Details
  const [courseDetails, setCourseDetails] = useState({ title: "", code: "", designation: "", description: "" });
  const [bannerImage, setBannerImage] = useState(null); // base64 string

  // Content Builder
  const [contentType, setContentType] = useState("section");
  const [currentData, setCurrentData] = useState(null);

  // Timeline (stores top-level items and sections with children)
  const [timeline, setTimeline] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // Certification Tab State
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [selectedCertificateIds, setSelectedCertificateIds] = useState([]);

  useEffect(() => {
    // Load available certificates from storage
    const certs = getCertifications();
    setAvailableCertificates(certs);
  }, []);

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

        // Restore connected certificates if any
        if (found.certificateIds && Array.isArray(found.certificateIds)) {
          setSelectedCertificateIds(found.certificateIds);
        } else if (found.certificateId) {
          setSelectedCertificateIds([found.certificateId]);
        }

        // Normalize loaded timeline (migrate flat timeline if needed)
        const rawTimeline = found.timeline || [];
        const normalized = [];
        let curSec = null;

        for (const item of rawTimeline) {
          if (item.type === "section") {
            curSec = {
              ...item,
              children: Array.isArray(item.children) ? [...item.children] : []
            };
            normalized.push(curSec);
          } else if (curSec && !Array.isArray(curSec.children.find(c => c.id === item.id))) {
            // If item wasn't inside children, but follows a section in a legacy flat array
            if (!normalized.some(top => top.id === item.id)) {
              curSec.children.push(item);
            }
          } else {
            normalized.push(item);
          }
        }

        setTimeline(normalized);

        // Auto-expand all sections
        const exp = {};
        normalized.forEach(item => {
          if (item.type === "section") exp[item.id] = true;
        });
        setExpandedSections(exp);

        const lastSec = [...normalized].reverse().find(t => t.type === "section");
        if (lastSec) setActiveSectionId(lastSec.id);

        if (found.image) setBannerImage(found.image); // restore banner
      }
    }
  }, [editId]);

  const toggleSectionExpand = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddContent = () => {
    const isEmpty =
      !currentData ||
      (typeof currentData === "string" && !currentData.trim()) ||
      (typeof currentData === "object" && !currentData.body?.trim() && !currentData.question?.trim() && !currentData.name) ||
      (currentData instanceof File === false && typeof currentData === "object" && Object.keys(currentData).length === 0);
    if (isEmpty) return toast.warning("Please add content before adding to timeline.", { title: "Incomplete Content" });

    const newItemId = Date.now();

    if (contentType === "section") {
      // Create new Chapter / Section
      const newSection = {
        id: newItemId,
        type: "section",
        data: currentData,
        children: []
      };

      setTimeline(prev => [...prev, newSection]);
      setActiveSectionId(newItemId);
      setExpandedSections(prev => ({ ...prev, [newItemId]: true }));
      toast.success("New chapter created and set as active target.", { title: "Chapter Added" });
      // Set default content type to paragraph for convenient next input
      setContentType("paragraph");
      setCurrentData(null);
      return;
    }

    // Non-section content: Add inside active section if exists, otherwise at top-level
    const newItem = { id: newItemId, type: contentType, data: currentData };

    setTimeline(prev => {
      // Find if we have an active section
      const targetSecId = activeSectionId || [...prev].reverse().find(t => t.type === "section")?.id;

      if (targetSecId) {
        // Automatically make sure this section is marked active & expanded
        return prev.map(item => {
          if (item.id === targetSecId && item.type === "section") {
            return {
              ...item,
              children: [...(item.children || []), newItem]
            };
          }
          return item;
        });
      }

      // No section exists yet, add to top-level timeline
      return [...prev, newItem];
    });

    if (activeSectionId) {
      setExpandedSections(prev => ({ ...prev, [activeSectionId]: true }));
    }

    toast.success("Content block added to timeline.", { title: "Block Added" });
    setCurrentData(null);
  };

  // Remove top-level item or entire section
  const removeTopLevelItem = (id) => {
    setTimeline(prev => prev.filter(t => t.id !== id));
    if (activeSectionId === id) {
      setActiveSectionId(null);
    }
  };

  // Move top-level item
  const moveTopLevelItem = (idx, dir) => {
    setTimeline(prev => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // Remove a child inside a section
  const removeChildItem = (sectionId, childId) => {
    setTimeline(prev =>
      prev.map(item => {
        if (item.id === sectionId && item.children) {
          return {
            ...item,
            children: item.children.filter(c => c.id !== childId)
          };
        }
        return item;
      })
    );
  };

  // Reorder child items inside a section
  const moveChildItem = (sectionId, childIdx, dir) => {
    setTimeline(prev =>
      prev.map(item => {
        if (item.id === sectionId && item.children) {
          const arr = [...item.children];
          const newIdx = childIdx + dir;
          if (newIdx < 0 || newIdx >= arr.length) return item;
          [arr[childIdx], arr[newIdx]] = [arr[newIdx], arr[childIdx]];
          return { ...item, children: arr };
        }
        return item;
      })
    );
  };

  const saveCourse = async () => {
    if (!courseDetails.title) return toast.warning("Please enter a course title.", { title: "Title Required" });
    if (timeline.length === 0) return toast.warning("Please add at least one content block.", { title: "Empty Timeline" });

    // Process timeline: save base64 videos to IndexedDB, store only the key
    const processedTimeline = await Promise.all(
      timeline.map(async (item) => {
        if (item.type === "section" && Array.isArray(item.children)) {
          const processedChildren = await Promise.all(
            item.children.map(async (child) => {
              if (child.type === "video" && typeof child.data === "string" && child.data.startsWith("data:video")) {
                const videoKey = await saveVideoToDB(child.data);
                return { ...child, data: videoKey };
              }
              return child;
            })
          );
          return { ...item, children: processedChildren };
        }

        if (item.type === "video" && typeof item.data === "string" && item.data.startsWith("data:video")) {
          const videoKey = await saveVideoToDB(item.data);
          return { ...item, data: videoKey }; // store IDB key instead of base64
        }
        return item;
      })
    );

    const schemes = ["blue", "teal", "emerald", "indigo"];
    const connectedCerts = availableCertificates.filter(c => selectedCertificateIds.includes(c.id));
    const newCourse = {
      id: editId ? Number(editId) : Date.now(),
      title: courseDetails.title,
      code: courseDetails.code || "N/A",
      designation: courseDetails.designation || "All Designations",
      description: courseDetails.description,
      status: "Active",
      colorScheme: schemes[Math.floor(Math.random() * schemes.length)],
      timeline: processedTimeline,
      image: bannerImage || null, // ← banner image saved here
      certificateIds: selectedCertificateIds,
      connectedCertificates: connectedCerts.map(c => ({
        id: c.id,
        courseTitle: c.courseTitle,
        certificateNo: c.certificateNo,
        validity: c.validity,
        category: c.category
      }))
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
      toast.error("Storage quota exceeded even after video optimization. Please remove some large images.", { title: "Storage Error" });
      return;
    }

    window.dispatchEvent(new Event("storage"));
    toast.success(editId ? "Course updated successfully!" : "Course published successfully!", { title: "Course Saved" });
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
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm w-full max-w-md">
              <button onClick={() => setActiveTab("details")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === "details" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <BookOpen className="w-3.5 h-3.5" /> Course Details
              </button>
              <button onClick={() => setActiveTab("content")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === "content" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <Plus className="w-3.5 h-3.5" /> Add Content
              </button>
              <button onClick={() => setActiveTab("certification")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === "certification" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                <Award className="w-3.5 h-3.5" /> Certification
                {selectedCertificateIds.length > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${activeTab === "certification" ? "bg-white/20 text-white" : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"}`}>
                    {selectedCertificateIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 themed-scroll">

            {/* ──────────── DETAILS TAB ──────────── */}
            {activeTab === "details" && (
              <div className="space-y-6 w-full">
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
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 transition-all cursor-pointer group overflow-hidden relative">
                    {bannerImage ? (
                      <>
                        <img src={bannerImage} alt="Banner preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="w-6 h-6 text-white mb-1" />
                          <span className="text-xs font-semibold text-white">Change banner</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                        <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-500">Click to upload banner</span>
                        <span className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => setBannerImage(evt.target.result);
                          reader.readAsDataURL(file);
                        }
                      }} />
                  </label>
                  {bannerImage && (
                    <button type="button" onClick={() => setBannerImage(null)}
                      className="text-xs font-bold text-red-500 hover:underline">
                      Remove banner
                    </button>
                  )}
                </div>

                <button onClick={() => setActiveTab("content")}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                  Next: Add Content <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ──────────── CONTENT BUILDER TAB ──────────── */}
            {activeTab === "content" && (
              <div className="space-y-6 w-full">

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

                  {/* Active Section Context Banner */}
                  {contentType !== "section" && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Target Chapter: </span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {timeline.find(t => t.id === activeSectionId && t.type === "section")
                              ? (timeline.find(t => t.id === activeSectionId)?.data || "Untitled Section")
                              : (timeline.find(t => t.type === "section")
                                  ? `${[...timeline].reverse().find(t => t.type === "section")?.data} (Latest)`
                                  : "None (Will be added at top-level)")}
                          </span>
                        </div>
                      </div>
                      {timeline.some(t => t.type === "section") && (
                        <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-medium hidden sm:inline">
                          Content will be placed inside this chapter
                        </span>
                      )}
                    </div>
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

            {/* ──────────── CERTIFICATION TAB ──────────── */}
            {activeTab === "certification" && (
              <div className="space-y-6 w-full">
                
                {/* Information Header Banner */}
                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Course Completion Certification
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Select the accredited qualification certificate(s) that will be automatically awarded to staff upon completing all modules & assessments of this course.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/hr-head/certification/create")}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Design New Certificate
                  </button>
                </div>

                {/* Selected Summary Pill Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Available Accredited Certificates ({availableCertificates.length})
                    </span>
                    {selectedCertificateIds.length > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        {selectedCertificateIds.length} Linked to Course
                      </span>
                    )}
                  </div>

                  {selectedCertificateIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCertificateIds([])}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Certificates Grid List */}
                {availableCertificates.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                    <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Certificates Found</p>
                      <p className="text-xs text-slate-400 mt-1">Design a new certificate first to link with this course.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/hr-head/certification/create")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                    >
                      Create First Certificate
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCertificates.map((cert) => {
                      const isSelected = selectedCertificateIds.includes(cert.id);
                      return (
                        <div
                          key={cert.id}
                          onClick={() => {
                            setSelectedCertificateIds(prev => 
                              prev.includes(cert.id)
                                ? prev.filter(id => id !== cert.id)
                                : [...prev, cert.id]
                            );
                          }}
                          className={`relative p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-3 group ${
                            isSelected
                              ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 shadow-md shadow-blue-500/10"
                              : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600"
                              }`}>
                                <Award className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                  {cert.courseTitle}
                                </h5>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  {cert.department || "Hospital Wide"} {cert.courseCode ? `· ${cert.courseCode}` : ""}
                                </p>
                              </div>
                            </div>

                            {/* Checkbox Icon */}
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-xs"
                                : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-blue-400"
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Credential Details Pills */}
                          <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px]">
                            <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              Validity: {cert.validity || "1 Year"}
                            </span>
                            {cert.category && (
                              <span className="font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {cert.category}
                              </span>
                            )}
                            {cert.certificateNo && (
                              <span className="font-semibold px-2 py-0.5 rounded-md text-slate-400 dark:text-slate-500">
                                ID: {cert.certificateNo}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save guidance note */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Selected certificates are permanently saved with this course on publishing.</span>
                  </span>
                  <button
                    type="button"
                    onClick={saveCourse}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 shrink-0"
                  >
                    Save & Publish Course
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: Timeline (1 col) */}
        <div className="xl:col-span-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">

          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-600" /> Course Timeline
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5 flex-wrap gap-1">
              <span>
                {timeline.reduce((acc, it) => acc + (it.type === "section" ? (it.children?.length || 0) : 1), 0)} content item{timeline.length !== 1 ? "s" : ""} across {timeline.filter(t => t.type === "section").length} chapter{timeline.filter(t => t.type === "section").length !== 1 ? "s" : ""}
              </span>
              {selectedCertificateIds.length > 0 && (
                <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md text-[10px]">
                  <Award className="w-3 h-3" /> {selectedCertificateIds.length} Cert Linked
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 themed-scroll">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-12 opacity-60">
                <ListOrdered className="w-10 h-10 mb-3" />
                <p className="text-xs font-semibold text-center leading-relaxed">
                  Timeline is empty.<br />Start by creating a Section / Chapter or content block.
                </p>
              </div>
            ) : (
              timeline.map((item, idx) => {
                if (item.type === "section") {
                  return (
                    <SectionAccordionItem
                      key={item.id}
                      section={item}
                      index={idx}
                      totalSections={timeline.length}
                      isExpanded={!!expandedSections[item.id]}
                      onToggleExpand={() => toggleSectionExpand(item.id)}
                      isActiveSection={activeSectionId === item.id}
                      onSetActiveSection={() => setActiveSectionId(item.id)}
                      onRemoveSection={() => removeTopLevelItem(item.id)}
                      onMoveSectionUp={() => moveTopLevelItem(idx, -1)}
                      onMoveSectionDown={() => moveTopLevelItem(idx, 1)}
                      onRemoveChild={(childId) => removeChildItem(item.id, childId)}
                      onMoveChildUp={(childIdx) => moveChildItem(item.id, childIdx, -1)}
                      onMoveChildDown={(childIdx) => moveChildItem(item.id, childIdx, 1)}
                      selectedId={selectedId}
                      onSelectId={setSelectedId}
                    />
                  );
                }

                return (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    index={idx}
                    total={timeline.length}
                    isSelected={selectedId === item.id}
                    onSelect={() => setSelectedId(item.id)}
                    onRemove={() => removeTopLevelItem(item.id)}
                    onMoveUp={() => moveTopLevelItem(idx, -1)}
                    onMoveDown={() => moveTopLevelItem(idx, 1)}
                  />
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button onClick={saveCourse}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                timeline.length > 0 && courseDetails.title
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}>
              <CheckCircle2 className="w-4 h-4" /> Publish Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <CreateCourseContent />
    </Suspense>
  );
}
