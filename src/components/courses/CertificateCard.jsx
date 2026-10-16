"use client";

import React from "react";
import { ArrowUpRight, Award, ShieldCheck, MoreVertical, Edit3, RefreshCw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function CertificateCard({
  certificate,
  actionLabel = "View Details",
  onAction,
  showStaff = true,
  isManagement = false,
  onEdit,
  onRenew,
  onDelete
}) {
  const {
    id,
    certificateNo,
    courseTitle,
    courseCode,
    description,
    features = [],
    staffName,
    department,
    designation,
    validity,
    validitySubtext,
    footnote,
    issueDate,
    expiryDate,
    status = "Active",
    isUploaded,
    fileName
  } = certificate;

  // Dynamic values with clean medical fallbacks
  const displayTitle = courseTitle || "Clinical Accreditation";
  const displayDesc = description || (
    isUploaded
      ? `Officially uploaded clinical credential (${fileName || "Medical Document"}) verified on record for hospital quality compliance.`
      : "Official hospital credential awarded upon successful demonstration of clinical competence, patient safety protocols, and medical standards."
  );

  // Dynamic medical feature checklist
  const displayFeatures = features && features.length > 0 ? features : [
    "Clinical Protocol & Patient Safety Standards",
    "Evidence-Based Practice Competency Passed",
    "Accredited Continuing Medical Education (CME)"
  ];

  // Dynamic footnote and tenure
  const displayFootnote = footnote || (expiryDate ? `Valid until ${expiryDate}` : (certificateNo ? `ID: ${certificateNo}` : "Hospital Verified"));

  // Helper to format validity display cleanly without breaking UI
  const getFormattedValidity = () => {
    if (!validity) return "Active";
    
    // Check if validity or expiryDate contains a date (e.g., "Until 2026-10-16" or direct date)
    const targetDateStr = expiryDate || (validity.startsWith("Until ") ? validity.replace("Until ", "") : null);
    
    if (targetDateStr && !isNaN(new Date(targetDateStr).getTime())) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(targetDateStr);
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
    }

    return validity;
  };

  const displayValidity = getFormattedValidity();
  const displayValiditySub = validitySubtext || (expiryDate ? `Until ${expiryDate}` : (issueDate ? `Issued ${issueDate}` : "Certified"));

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* 
        OUTER CARD CONTAINER:
        Base background is soft violet (blue-100/70 in light, dark:bg-blue-950/40 in dark)
        with fully rounded 2.5rem outer corners and subtle border/shadow.
      */}
      <div className="relative bg-blue-100/70 dark:bg-blue-950/40 rounded-[2.5rem] shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-900/40 overflow-hidden flex flex-col justify-between min-h-[460px]">
        
        {/* 3D Isometric Medical Cross/Cube Watermark in Background */}
        <div className="absolute -bottom-6 -right-6 w-52 h-52 pointer-events-none select-none opacity-25 dark:opacity-20 text-blue-400 dark:text-blue-500 z-0">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M100 25 L165 62 L165 137 L100 175 L35 137 L35 62 Z" />
            <path d="M100 25 L100 100 L165 137" />
            <path d="M100 100 L35 137" />
            <path d="M100 50 L140 73 L140 120 L100 143 L60 120 L60 73 Z" />
            <path d="M100 50 L100 95 L140 120" />
            <path d="M100 95 L60 120" />
          </svg>
        </div>

        {/* ── TOP SECTION: White Cutout with Title (Badge Label REMOVED) ── */}
        <div className="relative z-10 flex items-start justify-between">
          
          {/* Top-Left: WHITE CUTOUT BLOCK */}
          <div className="bg-white dark:bg-slate-900 pt-6 pb-4 pl-7 pr-8 rounded-br-[2.2rem] flex items-center gap-2.5 relative shadow-sm max-w-[85%]">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans truncate" title={displayTitle}>
              {displayTitle}
            </h2>

            {/* Smooth concave fillet corner on the right side of top cutout */}
            <div className="absolute -bottom-5 left-0 w-5 h-5 bg-transparent rounded-tl-[1.2rem] shadow-[-6px_-6px_0_0_#ffffff] dark:shadow-[-6px_-6px_0_0_#0f172a] pointer-events-none" />
            <div className="absolute top-0 -right-5 w-5 h-5 bg-transparent rounded-tl-[1.2rem] shadow-[-6px_-6px_0_0_#ffffff] dark:shadow-[-6px_-6px_0_0_#0f172a] pointer-events-none" />
          </div>

          {/* Top-Right: Natural violet background with Management Actions Menu */}
          <div className="pt-4 pr-5 flex items-center justify-end">
            {isManagement && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  title="Certificate Options"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs transition-colors border border-blue-200/40 dark:border-blue-800/40 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
                  <DropdownMenuItem
                    onClick={() => onEdit && onEdit(certificate)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Edit Certificate</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onRenew && onRenew(certificate)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Renew Validity</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />

                  <DropdownMenuItem
                    onClick={() => onDelete && onDelete(certificate)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span>Delete Certificate</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ── MIDDLE BODY (Medical Methodology Description + Clinical Competencies Checklist) ── */}
        <div className="relative z-10 px-7 py-5 space-y-4 flex-1">
          {/* Recipient Clinical Information */}
          {showStaff && staffName && (
            <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Clinician: <strong className="text-slate-800 dark:text-slate-200">{staffName}</strong>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wide">
                {department}
              </span>
            </div>
          )}

          {/* Medical Clinical Methodology Description */}
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-normal pr-3">
            {displayDesc}
          </p>

          {/* Double-circle medical competencies checklist */}
          <ul className="space-y-2.5 pt-1">
            {displayFeatures.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-xs sm:text-[13px] font-normal text-slate-700 dark:text-slate-200">
                <span className="w-3.5 h-3.5 rounded-full border border-blue-400/80 dark:border-blue-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                </span>
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── BOTTOM SECTION: Tenure/Validity (Left) + Action Pill (Right) ── */}
        <div className="relative z-10 flex items-end justify-between">
          
          {/* Bottom-Left: Footnote + Validity / Accreditation Status */}
          <div className="pl-7 pb-6 space-y-1">
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              {displayFootnote}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {displayValidity}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {displayValiditySub}
              </span>
            </div>
          </div>

          {/* Bottom-Right: WHITE CUTOUT BLOCK */}
          <div className="bg-white dark:bg-slate-900 pt-4 pb-6 pl-6 pr-7 rounded-tl-[2.2rem] relative shadow-sm flex items-center">
            
            {/* Smooth concave fillet corners around the bottom cutout */}
            <div className="absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-[1.2rem] shadow-[6px_6px_0_0_#ffffff] dark:shadow-[6px_6px_0_0_#0f172a] pointer-events-none" />
            <div className="absolute bottom-0 -left-5 w-5 h-5 bg-transparent rounded-br-[1.2rem] shadow-[6px_6px_0_0_#ffffff] dark:shadow-[6px_6px_0_0_#0f172a] pointer-events-none" />

            {/* Pill Button (Medical Details action with connected arrow) */}
            <button
              onClick={() => onAction && onAction(certificate)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all duration-200 rounded-full shadow-md shadow-blue-600/30 group"
            >
              {/* Left pill text */}
              <span className="pl-4 pr-3 py-2 text-xs sm:text-sm font-semibold tracking-normal whitespace-nowrap">
                {actionLabel}
              </span>

              {/* Dividing separator */}
              <span className="w-[1px] h-4 bg-white/20 self-center" />

              {/* Right circular arrow */}
              <span className="w-8 h-8 rounded-full flex items-center justify-center ml-0.5 mr-0.5 group-hover:rotate-45 transition-transform duration-200">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
