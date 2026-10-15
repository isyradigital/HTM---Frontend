"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * CertificateCard
 * 
 * Recreates the EXACT reciprocal geometric cutouts from the reference:
 * 1. Top Section:
 *    - Left: White cutout with rounded-br containing Title + Pill badge
 *    - Right: Soft violet background flowing up to top-right corner
 * 2. Middle Section:
 *    - Soft violet card body with paragraph, double-ring bullets, and 3D isometric cube
 * 3. Bottom Section:
 *    - Left: Soft violet continuing down with footnote and price (0₽ 10% of budget)
 *    - Right: White cutout (matching the top-left style) with rounded-tl containing the pill button
 */
export function CertificateCard({
  certificate,
  actionLabel = "Start for free",
  onAction,
  showStaff = true
}) {
  const {
    id,
    certificateNo,
    courseTitle = "Advertising",
    courseCode = "MED-101",
    badgeLabel = "10%",
    typeTag,
    description = 'If you don\'t know your budget yet. Full access to "Advertising Management": automatic control of bids and impressions.',
    features = [
      "Unlimited advertising",
      "Pay as you use it",
      "Any number of stores"
    ],
    staffName,
    department,
    designation,
    validity = "0₽",
    validitySubtext = "10% of budget",
    footnote = "until you open an ad worth 10,000",
    issueDate,
    status = "Active"
  } = certificate;

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* 
        OUTER CARD CONTAINER:
        Base background is soft violet (blue-100/70 in light, dark:bg-blue-950/40 in dark)
        with fully rounded 2.5rem outer corners and subtle border/shadow.
      */}
      <div className="relative bg-blue-100/70 dark:bg-blue-950/40 rounded-[2.5rem] shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-900/40 overflow-hidden flex flex-col justify-between min-h-[460px]">
        
        {/* 3D Isometric Cube Watermark (positioned behind bottom-right) */}
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

        {/* ── TOP SECTION ── */}
        <div className="relative z-10 flex items-start justify-between">
          
          {/* Top-Left: WHITE CUTOUT BLOCK */}
          <div className="bg-white dark:bg-slate-900 pt-6 pb-4 pl-7 pr-8 rounded-br-[2.2rem] flex items-center gap-3 relative shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white font-sans truncate max-w-[190px]" title={courseTitle}>
              {courseTitle}
            </h2>

            {/* Outlined Pill Badge (e.g. "10%" / "fix") */}
            <div className="shrink-0 px-3.5 py-1 rounded-full border border-slate-400/80 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-normal text-base sm:text-lg">
              {badgeLabel || typeTag || "10%"}
            </div>

            {/* Smooth concave fillet corner on the right side of top cutout */}
            <div className="absolute -bottom-5 left-0 w-5 h-5 bg-transparent rounded-tl-[1.2rem] shadow-[-6px_-6px_0_0_#ffffff] dark:shadow-[-6px_-6px_0_0_#0f172a] pointer-events-none" />
            <div className="absolute top-0 -right-5 w-5 h-5 bg-transparent rounded-tl-[1.2rem] shadow-[-6px_-6px_0_0_#ffffff] dark:shadow-[-6px_-6px_0_0_#0f172a] pointer-events-none" />
          </div>

          {/* Top-Right: Natural violet background */}
          <div className="flex-1" />
        </div>

        {/* ── MIDDLE BODY (Description + Checklist) ── */}
        <div className="relative z-10 px-7 py-5 space-y-4 flex-1">
          {/* Optional recipient info */}
          {showStaff && staffName && (
            <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Recipient: <strong className="text-slate-800 dark:text-slate-200">{staffName}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{department}</span>
            </div>
          )}

          {/* Paragraph */}
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-normal pr-3">
            {description}
          </p>

          {/* Double-circle bullet checklist */}
          <ul className="space-y-3 pt-1">
            {features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-xs sm:text-[13px] font-normal text-slate-700 dark:text-slate-200">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-400/80 dark:border-slate-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div className="relative z-10 flex items-end justify-between">
          
          {/* Bottom-Left: Footnote + Large Price/Validity Text (on violet background) */}
          <div className="pl-7 pb-6 space-y-1">
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-normal">
              {footnote || `until you open an ad worth 10,000`}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
                {validity || "0₽"}
              </span>
              <span className="text-xs sm:text-sm font-normal text-slate-400 dark:text-slate-400">
                {validitySubtext || (issueDate ? `Issued ${issueDate}` : "10% of budget")}
              </span>
            </div>
          </div>

          {/* Bottom-Right: WHITE CUTOUT BLOCK (Matching the top-left heading notch exactly) */}
          <div className="bg-white dark:bg-slate-900 pt-4 pb-6 pl-6 pr-7 rounded-tl-[2.2rem] relative shadow-sm flex items-center">
            
            {/* Smooth concave fillet corners around the bottom cutout */}
            <div className="absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-[1.2rem] shadow-[6px_6px_0_0_#ffffff] dark:shadow-[6px_6px_0_0_#0f172a] pointer-events-none" />
            <div className="absolute bottom-0 -left-5 w-5 h-5 bg-transparent rounded-br-[1.2rem] shadow-[6px_6px_0_0_#ffffff] dark:shadow-[6px_6px_0_0_#0f172a] pointer-events-none" />

            {/* Pill Button (Text capsule + Connected circular arrow button) */}
            <button
              onClick={() => onAction && onAction(certificate)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all duration-200 rounded-full shadow-md shadow-blue-600/30 group"
            >
              {/* Left pill text */}
              <span className="pl-4 pr-3 py-2 text-xs sm:text-sm font-normal tracking-normal whitespace-nowrap">
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
