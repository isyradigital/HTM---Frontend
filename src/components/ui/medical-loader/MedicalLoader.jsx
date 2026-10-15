import React from "react";
import { EcgLineSvg } from "./EcgLineSvg";
import { MedicalHeartIcon } from "./MedicalHeartIcon";
import { Activity } from "lucide-react";

/**
 * MedicalLoader
 * 
 * Modular Medical-themed Loader adhering to AI Agent Protocols:
 * - Theme-matched with hospital blue palette
 * - Medical aesthetics (HeartPulse, ECG line, vital status)
 * - Flexible display modes:
 *    - fullScreen: Full viewport overlay with glassmorphism
 *    - overlay: In-card absolute overlay with backdrop-blur
 *    - inline / standard: Embedded within content block
 */
export function MedicalLoader({
  title = "Fetching Medical Records...",
  subtitle = "Synchronizing patient & hospital clinical data",
  variant = "standard", // "standard" | "fullScreen" | "overlay" | "inline"
  size = "md",          // "sm" | "md" | "lg"
  showEcg = true,
  className = ""
}) {
  // 1. Inline minimal loader
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 ${className}`}>
        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center animate-heartbeat shadow-xs">
          <Activity className="w-3 h-3" />
        </div>
        <span className="text-xs font-bold tracking-tight">{title}</span>
      </div>
    );
  }

  // Content block used inside container
  const loaderContent = (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto select-none">
      {/* Animated HeartPulse Icon with glow */}
      <div className="mb-4">
        <MedicalHeartIcon size={size} />
      </div>

      {/* Animated Medical ECG Waveform */}
      {showEcg && (
        <div className="w-full flex justify-center -my-1 text-blue-600 dark:text-blue-400">
          <EcgLineSvg className="w-44 h-11" />
        </div>
      )}

      {/* Status Title */}
      <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-2 tracking-tight">
        {title}
      </h3>

      {/* Subtitle / Context description */}
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Medical Vitals Indicator Badge */}
      <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          Live Clinical Sync
        </span>
      </div>
    </div>
  );

  // 2. FullScreen variant (Modal/Viewport overlay)
  if (variant === "fullScreen") {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-black/50 backdrop-blur-md animate-in fade-in duration-300 ${className}`}>
        <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-blue-500/10 p-4">
          {loaderContent}
        </div>
      </div>
    );
  }

  // 3. Card Overlay variant (e.g. inside a table or form)
  if (variant === "overlay") {
    return (
      <div className={`absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 ${className}`}>
        {loaderContent}
      </div>
    );
  }

  // 4. Standard in-flow block loader
  return (
    <div className={`w-full min-h-[240px] flex items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40 ${className}`}>
      {loaderContent}
    </div>
  );
}
