"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Award, ShieldCheck, ChevronDown, Calendar, Check,
  Plus, Sparkles, FileText, Stethoscope, Activity, Heart, Save
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createCertification, updateCertification, getCertifications } from "@/lib/certificationService";
import { useToast } from "@/components/ToastProvider";

// ─── Template Definitions ────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "classic",   label: "Classic Medical",    icon: Award       },
  { id: "surgical",  label: "Surgical Operative", icon: Activity    },
  { id: "nursing",   label: "Nursing Excellence", icon: Heart       },
  { id: "emergency", label: "Emergency Protocol", icon: Stethoscope },
];

// ─── ACTUAL DIPLOMA CERTIFICATES (Matching Preview modal sheet) ──────────────

// ─── TEMPLATE 1: Classic Hospital Accreditation (Blue/Navy Double Border) ────
function TemplateClassic({ data }) {
  const {
    courseTitle = "Clinical Accreditation Course",
    courseCode  = "MED-101",
    staffName   = "Dr. Rajesh Sharma",
    department  = "Cardiology",
    designation = "Medical Officer",
    category    = "Clinical Care",
    validity    = "1 Year",
    issueDate   = new Date().toISOString().split("T")[0],
    expiryDate,
  } = data;

  return (
    <div className="relative w-full rounded-[2rem] border-4 border-double border-blue-300 dark:border-blue-800/80 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 p-8 md:p-10 text-center shadow-xl shadow-blue-500/10 overflow-hidden select-none">
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <Award className="w-80 h-80 text-blue-900 dark:text-blue-200" />
      </div>

      <div className="relative z-10">
        {/* Crest */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
          <Award className="w-8 h-8" />
        </div>

        <p className="text-[11px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-1.5">
          Hospital Training & Medical Accreditation Board
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Certificate of Competence
        </h2>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
          This is to officially certify that
        </p>

        {/* Recipient */}
        <div className="my-4">
          <p className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {staffName || "Staff Recipient Name"}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
            {department || "Clinical"} Department {designation ? `· ${designation}` : ""}
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto my-5 leading-relaxed">
          has successfully satisfied all rigorous clinical modules, hands-on hospital assessments, and quality safety protocols in:
        </p>

        {/* Course */}
        <div className="inline-block bg-blue-100/60 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-base md:text-lg font-black text-slate-900 dark:text-white">
            "{courseTitle || "Course Title"}"
          </p>
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            Discipline: {category || "Clinical Care"} {courseCode ? `· Accreditation ID: ${courseCode}` : ""}
          </p>
        </div>

        {/* Footer Details & Signatures */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="text-left">
            <p className="font-bold text-slate-800 dark:text-slate-200">Issue Date: {issueDate}</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {expiryDate ? `Valid Until: ${expiryDate}` : `Validity: ${validity}`}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-400 dark:border-blue-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">Hospital Seal</span>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-800 dark:text-slate-200">Director of Medical Education</p>
            <p>Hospital Administration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 2: Surgical Operative Prestige (Gold / Dark Charcoal Diploma) ─
function TemplateSurgical({ data }) {
  const {
    courseTitle = "Surgical Operative Protocol",
    courseCode  = "SUR-201",
    staffName   = "Staff Name",
    department  = "Surgery",
    designation = "Surgeon / Consultant",
    category    = "Surgery",
    validity    = "3 Years",
    issueDate   = new Date().toISOString().split("T")[0],
    expiryDate,
  } = data;

  return (
    <div className="relative w-full rounded-[2rem] border-4 border-double border-amber-400/80 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-8 md:p-10 text-center shadow-xl shadow-amber-500/10 overflow-hidden select-none text-white">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <Activity className="w-80 h-80 text-amber-400" />
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <Activity className="w-8 h-8" />
        </div>

        <p className="text-[11px] font-black tracking-widest uppercase text-amber-400 mb-1.5">
          Board of Surgical Specialty & Operative Care
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
          Fellowship & Operative Accreditation
        </h2>

        <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
          Awarded with highest clinical distinction to
        </p>

        <div className="my-4">
          <p className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight">
            {staffName || "Staff Recipient Name"}
          </p>
          <p className="text-xs font-bold text-slate-300 mt-1">
            {department || "Surgery"} Department {designation ? `· ${designation}` : ""}
          </p>
        </div>

        <p className="text-xs text-slate-300 max-w-lg mx-auto my-5 leading-relaxed">
          for demonstrated surgical proficiency, high-acuity operative safety, and procedural mastery in:
        </p>

        <div className="inline-block bg-amber-400/10 border border-amber-400/40 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-base md:text-lg font-black text-amber-200">
            "{courseTitle || "Course Title"}"
          </p>
          <p className="text-[11px] font-bold text-amber-400/90 mt-0.5">
            Surgical Domain: {category || "Surgery"} {courseCode ? `· Accreditation ID: ${courseCode}` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-amber-400/20 text-[11px] text-slate-400">
          <div className="text-left">
            <p className="font-bold text-slate-200">Issued: {issueDate}</p>
            <p className="font-medium text-amber-400">
              {expiryDate ? `Tenure: Until ${expiryDate}` : `Tenure: ${validity}`}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-amber-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-amber-400">Surgical Seal</span>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-200">Chief of Surgical Services</p>
            <p>Clinical Board</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3: Nursing & Patient Care Excellence (Teal & Emerald) ──────────
function TemplateNursing({ data }) {
  const {
    courseTitle = "Critical Care Nursing Excellence",
    courseCode  = "NUR-301",
    staffName   = "Staff Name",
    department  = "Critical Care / Nursing",
    designation = "Senior Nursing Officer",
    category    = "Nursing",
    validity    = "1 Year",
    issueDate   = new Date().toISOString().split("T")[0],
    expiryDate,
  } = data;

  return (
    <div className="relative w-full rounded-[2rem] border-4 border-double border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/50 dark:from-teal-950/60 dark:via-slate-900 dark:to-emerald-950/30 p-8 md:p-10 text-center shadow-xl shadow-teal-500/10 overflow-hidden select-none">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Heart className="w-80 h-80 text-teal-800" />
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/30">
          <Heart className="w-8 h-8" />
        </div>

        <p className="text-[11px] font-black tracking-widest uppercase text-teal-600 dark:text-teal-400 mb-1.5">
          Council of Clinical Nursing & Patient Excellence
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Certificate of Nursing Distinction
        </h2>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
          Presented with honor to
        </p>

        <div className="my-4">
          <p className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
            {staffName || "Staff Recipient Name"}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
            {department || "Nursing"} Department {designation ? `· ${designation}` : ""}
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto my-5 leading-relaxed">
          for high-level compassionate care, clinical patient safety standards, and advanced nursing competence in:
        </p>

        <div className="inline-block bg-teal-100/60 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/60 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-base md:text-lg font-black text-slate-900 dark:text-white">
            "{courseTitle || "Course Title"}"
          </p>
          <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
            Curriculum: {category || "Nursing"} {courseCode ? `· Accreditation ID: ${courseCode}` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="text-left">
            <p className="font-bold text-slate-800 dark:text-slate-200">Date: {issueDate}</p>
            <p className="font-medium text-teal-600 dark:text-teal-400">
              {expiryDate ? `Certified Until: ${expiryDate}` : `Term: ${validity}`}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-teal-600 dark:text-teal-400">Nursing Seal</span>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-800 dark:text-slate-200">Nursing Director</p>
            <p>Quality & Patient Care</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 4: Emergency & Trauma Protocol (Crimson / Deep Rose) ───────────
function TemplateEmergency({ data }) {
  const {
    courseTitle = "Advanced Trauma & Emergency Life Support",
    courseCode  = "ER-401",
    staffName   = "Staff Name",
    department  = "Emergency Medicine",
    designation = "Emergency Physician",
    category    = "Emergency",
    validity    = "2 Years",
    issueDate   = new Date().toISOString().split("T")[0],
    expiryDate,
  } = data;

  return (
    <div className="relative w-full rounded-[2rem] border-4 border-double border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40 dark:from-red-950/50 dark:via-slate-900 dark:to-rose-950/30 p-8 md:p-10 text-center shadow-xl shadow-red-500/10 overflow-hidden select-none">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Stethoscope className="w-80 h-80 text-red-900" />
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
          <Stethoscope className="w-8 h-8" />
        </div>

        <p className="text-[11px] font-black tracking-widest uppercase text-red-600 dark:text-red-400 mb-1.5">
          Emergency Trauma & Resuscitation Authority
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Emergency Clinical Certification
        </h2>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
          Conferred upon the clinician
        </p>

        <div className="my-4">
          <p className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
            {staffName || "Staff Recipient Name"}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
            {department || "Emergency"} Department {designation ? `· ${designation}` : ""}
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto my-5 leading-relaxed">
          having mastered high-stakes emergency stabilization, trauma resuscitation, and critical emergency procedures in:
        </p>

        <div className="inline-block bg-red-100/60 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-base md:text-lg font-black text-slate-900 dark:text-white">
            "{courseTitle || "Course Title"}"
          </p>
          <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mt-0.5">
            Discipline: {category || "Emergency"} {courseCode ? `· Accreditation ID: ${courseCode}` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="text-left">
            <p className="font-bold text-slate-800 dark:text-slate-200">Dated: {issueDate}</p>
            <p className="font-medium text-red-600 dark:text-red-400">
              {expiryDate ? `Expires: ${expiryDate}` : `Term: ${validity}`}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center text-red-600 dark:text-red-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-red-600 dark:text-red-400">Trauma Seal</span>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-800 dark:text-slate-200">Head of Emergency Medicine</p>
            <p>Trauma Services</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_COMPONENTS = {
  classic:   TemplateClassic,
  surgical:  TemplateSurgical,
  nursing:   TemplateNursing,
  emergency: TemplateEmergency,
};

// ─── Main CreateCertificateContent (Inner with useSearchParams) ───────────────
function CreateCertificateContent({ role = "admin", backPath = "/hr-head/certification" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = Boolean(editId);

  const toast  = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode:  "",
    staffName:   "",
    staffId:     "",
    department:  "",
    designation: "",
    category:    "Clinical Care",
    validity:    "1 Year",
    customDate:  "",
    issueDate:   new Date().toISOString().split("T")[0],
    expiryDate:  "",
  });

  // Load existing certificate if in edit mode
  useEffect(() => {
    if (!editId) return;
    const allCerts = getCertifications();
    const existing = allCerts.find(c => String(c.id) === String(editId));
    if (existing) {
      setFormData({
        courseTitle: existing.courseTitle || "",
        courseCode:  existing.courseCode || "",
        staffName:   existing.staffName || "",
        staffId:     existing.staffId || "",
        department:  existing.department || "",
        designation: existing.designation || "",
        category:    existing.category || "Clinical Care",
        validity:    existing.validity || "1 Year",
        customDate:  existing.customDate || (existing.expiryDate || ""),
        issueDate:   existing.issueDate || new Date().toISOString().split("T")[0],
        expiryDate:  existing.expiryDate || "",
      });
      if (existing.template && TEMPLATES.some(t => t.id === existing.template)) {
        setSelectedTemplate(existing.template);
      }
    }
  }, [editId]);

  const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  // Auto-compute expiryDate from validity preset (only if not manually custom)
  useEffect(() => {
    if (formData.validity === "Custom Date") return;
    const today = new Date();
    let d = new Date(today);
    if      (formData.validity === "3 Months") d.setMonth(d.getMonth() + 3);
    else if (formData.validity === "6 Months") d.setMonth(d.getMonth() + 6);
    else if (formData.validity === "1 Year")   d.setFullYear(d.getFullYear() + 1);
    else if (formData.validity === "3 Years")  d.setFullYear(d.getFullYear() + 3);
    else return;
    setFormData(prev => ({ ...prev, expiryDate: d.toISOString().split("T")[0] }));
  }, [formData.validity]);

  // Build live features for the preview
  const liveFeatures = [
    formData.courseTitle ? `Curriculum: ${formData.courseTitle}` : "Clinical Protocol & Patient Safety Standards",
    formData.staffName   ? `Recipient: ${formData.staffName}`    : "Evidence-Based Practice Competency Passed",
    formData.category    ? `Discipline: ${formData.category}`    : "Accredited Continuing Medical Education",
    formData.expiryDate  ? `Valid until: ${formData.expiryDate}` : formData.validity ? `Validity: ${formData.validity}` : "Accredited for Clinical Practice",
  ];

  const finalExpiry   = formData.validity === "Custom Date" ? formData.customDate : formData.expiryDate;
  
  // Format custom validity cleanly into Days / Months / Years instead of raw "Until YYYY-MM-DD"
  const getCustomValidityLabel = (dateStr) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) return "Custom";
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires Today";
    if (diffDays === 1) return "1 Day";
    if (diffDays <= 90) return `${diffDays} Days`;
    const months = Math.round(diffDays / 30);
    if (months < 12) return `${months} Months`;
    const years = (diffDays / 365).toFixed(1).replace(".0", "");
    return `${years} Year${years === "1" ? "" : "s"}`;
  };

  const finalValidity = formData.validity === "Custom Date"
    ? getCustomValidityLabel(formData.customDate)
    : formData.validity;

  const liveData = {
    ...formData,
    features:   liveFeatures,
    expiryDate: finalExpiry,
    validity:   finalValidity,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.courseTitle || !formData.staffName) {
      toast.error("Please fill in Course Title and Staff Name", { title: "Required Fields" });
      return;
    }
    if (formData.validity === "Custom Date" && !formData.customDate) {
      toast.error("Please select a custom expiry date", { title: "Custom Date Required" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (isEditing) {
      updateCertification(editId, {
        ...formData,
        template:       selectedTemplate,
        validity:       finalValidity,
        footnote:       finalExpiry ? `Valid until ${finalExpiry}` : `Accredited ${finalValidity}`,
        description:    `Hospital accredited qualification in "${formData.courseTitle}" officially issued to ${formData.staffName} (${formData.department || "Hospital"} Department).`,
        features:       liveFeatures,
        expiryDate:     finalExpiry,
      });
      toast.success(`Certificate "${formData.courseTitle}" updated successfully!`, { title: "Certificate Updated" });
    } else {
      createCertification({
        ...formData,
        template:       selectedTemplate,
        validity:       finalValidity,
        validitySubtext: `Issued ${today}`,
        footnote:       finalExpiry ? `Valid until ${finalExpiry}` : `Accredited ${finalValidity}`,
        description:    `Hospital accredited qualification in "${formData.courseTitle}" officially issued to ${formData.staffName} (${formData.department || "Hospital"} Department).`,
        features:       liveFeatures,
        issueDate:      formData.issueDate || today,
        expiryDate:     finalExpiry,
        status:         "Active",
      });
      toast.success(`Certificate "${formData.courseTitle}" created successfully!`, { title: "Certificate Created" });
    }

    router.push(backPath);
  };

  const PreviewComponent = TEMPLATE_COMPONENTS[selectedTemplate] || TemplateClassic;

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">

      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={isEditing ? "Edit Certificate" : "Create Certificate"}
          description={
            isEditing
              ? "Modify credential information, recipient credentials, and validity details."
              : "Design, preview and issue an accredited hospital medical certificate."
          }
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(backPath)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Certifications
          </button>
        </div>
      </div>

      {/* Main Grid: Card container rounded-[2rem] matching Create Course */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 overflow-hidden">

        {/* ── LEFT PANEL: Live Preview & Template Picker (Expanded to 7 cols) ── */}
        <div className="xl:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Live Certificate Preview</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Real-time Certificate Display</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 themed-scroll">
            {/* Certificate Preview Card */}
            <div className="w-full max-w-2xl mx-auto">
              <PreviewComponent data={liveData} />
            </div>

            {/* Template Selector */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Select Certificate Design Style
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isActive = selectedTemplate === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md shadow-blue-500/10"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
                          {tmpl.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 font-medium ${isActive ? "text-blue-500 font-semibold" : "text-slate-400"}`}>
                          {isActive ? "Active" : "Select"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Form (Reduced to 5 cols) ── */}
        <div className="xl:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Certificate Credentials Form</span>
            </div>
            <span className="text-xs text-slate-400">Fill details to generate credential</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 themed-scroll">

            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Certificate Details</h2>
              <p className="text-sm text-slate-400 mt-1">Fill in the information below. The preview updates live on the left.</p>
            </div>

            <form id="create-cert-form" onSubmit={handleSubmit} className="space-y-8">

              {/* ─ Section: Course Info ─ */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Course Information</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Course / Program Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU Advanced Life Support Program"
                    value={formData.courseTitle}
                    onChange={(e) => setField("courseTitle", e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Course Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ICU-301"
                      value={formData.courseCode}
                      onChange={(e) => setField("courseCode", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Discipline
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option>Clinical Care</option>
                      <option>Surgery</option>
                      <option>Nursing</option>
                      <option>Emergency</option>
                      <option>Critical Care</option>
                      <option>Anaesthesiology</option>
                      <option>Radiology</option>
                      <option>Pharmacy</option>
                      <option>Oncology</option>
                      <option>Cardiology</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* ─ Section: Recipient ─ */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Recipient Information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={formData.staffName}
                      onChange={(e) => setField("staffName", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Staff ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WF-0042"
                      value={formData.staffId}
                      onChange={(e) => setField("staffId", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology"
                      value={formData.department}
                      onChange={(e) => setField("department", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Consultant"
                      value={formData.designation}
                      onChange={(e) => setField("designation", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* ─ Section: Validity & Dates ─ */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Validity &amp; Dates</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setField("issueDate", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Validity Duration <span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-750">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                          {formData.validity}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[220px] rounded-2xl p-1.5 shadow-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 backdrop-blur-md z-50 animate-in fade-in-50 zoom-in-95">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Duration</div>
                        {[
                          { label: "3 Months",    desc: "Short-term accreditation" },
                          { label: "6 Months",    desc: "Mid-term qualification" },
                          { label: "1 Year",      desc: "Annual medical renewal" },
                          { label: "3 Years",     desc: "Senior clinical tenure" },
                          { label: "Custom Date", desc: "Specific calendar expiry" },
                        ].map((opt) => {
                          const isSelected = formData.validity === opt.label;
                          return (
                            <DropdownMenuItem
                              key={opt.label}
                              onClick={() => setField("validity", opt.label)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold"
                                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span>{opt.label}</span>
                                <span className="text-[10px] font-normal text-slate-400">{opt.desc}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Custom Date */}
                {formData.validity === "Custom Date" && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 animate-in fade-in-50 duration-200">
                    <label className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Custom Expiry Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.customDate}
                      onChange={(e) => setField("customDate", e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}

                {/* Auto expiry badge */}
                {formData.validity !== "Custom Date" && formData.expiryDate && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/40 rounded-xl">
                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                      Auto-computed expiry: <strong>{formData.expiryDate}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* ── Submit Button (inside form) ── */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isEditing ? "Save Changes" : "Issue Certificate"}</span>
                </button>
              </div>

              <div className="pb-4" />
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export function CreateCertificatePage(props) {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CreateCertificateContent {...props} />
    </Suspense>
  );
}
