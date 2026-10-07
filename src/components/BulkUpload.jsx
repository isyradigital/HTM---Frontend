"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Download, CheckCircle2, Loader2, AlertCircle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

/* ─── Column name aliases (case-insensitive) ─────────────────────────────── */
const COL_MAP = {
  "training name": "title",
  "name": "title",
  "training": "title",
  "start date": "fromDate",
  "from date": "fromDate",
  "date": "fromDate",
  "end date": "toDate",
  "to date": "toDate",
  "start time": "fromTime",
  "from time": "fromTime",
  "time": "fromTime",
  "end time": "toTime",
  "to time": "toTime",
  "location": "location",
  "venue": "location",
  "designation": "designation",
  "target designation": "designation",
};

/* ─── Excel serial date → "YYYY-MM-DD" ──────────────────────────────────── */
function excelSerialToDateStr(serial) {
  // Excel day 1 = Jan 1 1900; JS epoch = Jan 1 1970
  const utcDays = Math.floor(serial - 25569);
  const utcMs = utcDays * 86400000;
  const d = new Date(utcMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ─── Normalise any date value to "YYYY-MM-DD" ───────────────────────────── */
function normaliseDate(val) {
  if (!val) return "";

  // Already a JS Date (XLSX can return these with cellDates:true)
  if (val instanceof Date) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const dd = String(val.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Numeric serial
  if (typeof val === "number") return excelSerialToDateStr(val);

  const str = String(val).trim();

  // Already ISO  YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD-MM-YYYY  or  DD/MM/YYYY  or  DD.MM.YYYY
  const dmy = str.match(/^(\d{1,2})[-/.\/](\d{1,2})[-/.\/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

  // MM/DD/YYYY
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;

  // Try native parse as last resort
  const d = new Date(str);
  if (!isNaN(d)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return str; // return as-is; let user fix
}

/* ─── Normalise time to "HH:MM" ─────────────────────────────────────────── */
function normaliseTime(val) {
  if (!val) return "09:00";

  // Numeric fraction (Excel time: 0.375 = 09:00)
  if (typeof val === "number") {
    const totalMinutes = Math.round(val * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const str = String(val).trim();
  // HH:MM or HH:MM:SS
  const hm = str.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${hm[1].padStart(2, "0")}:${hm[2]}`;

  return "09:00";
}

/* ─── Parse raw sheet rows → training objects ────────────────────────────── */
function parseRows(rows) {
  return rows
    .map((row, idx) => {
      // Map header keys → our field names (case-insensitive)
      const mapped = {};
      Object.entries(row).forEach(([key, val]) => {
        const normalKey = key.toLowerCase().trim()
          // strip parenthetical hints like "(YYYY-MM-DD)"
          .replace(/\s*\(.*?\)\s*/g, "")
          .trim();
        const field = COL_MAP[normalKey];
        if (field) mapped[field] = val;
      });

      if (!mapped.title) return null; // skip empty rows

      const fromDate = normaliseDate(mapped.fromDate);
      const toDate = normaliseDate(mapped.toDate) || fromDate;
      const fromTime = normaliseTime(mapped.fromTime);
      const toTime = normaliseTime(mapped.toTime) || "10:00";

      return {
        id: `bulk_${Date.now()}_${idx}`,
        title: String(mapped.title).trim(),
        fromDate,
        toDate,
        fromTime,
        toTime,
        location: mapped.location ? String(mapped.location).trim() : "",
        designation: mapped.designation ? String(mapped.designation).trim() : "",
        assignMode: "Group",
        assignedGroup: [],
        status: "Pending",
      };
    })
    .filter(Boolean);
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function BulkUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const [previewRows, setPreviewRows] = useState([]); // parsed preview
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Download template ─────────────────────────────────────────────────── */
  const handleDownloadTemplate = () => {
    const headers = "Training Name,Start Date (YYYY-MM-DD),End Date (YYYY-MM-DD),Start Time (HH:MM),End Time (HH:MM),Location,Designation\n";
    const example1 = "Basic Life Support,2026-10-15,2026-10-15,09:00,10:00,Conference Room A,All Designations\n";
    const example2 = "Advanced Cardiac Life Support (ACLS),2026-10-16,2026-10-16,11:00,13:00,Simulation Lab,Senior Consultant\n";
    const example3 = "Infection Control and Hand Hygiene,2026-10-18,2026-10-20,10:00,11:00,Training Hall,All Designations\n";
    const csvContent = headers + example1 + example2 + example3;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Training_Schedule_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Read + parse file ─────────────────────────────────────────────────── */
  const processFile = (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(null);
    setErrorMsg("");
    setPreviewRows([]);
    setParsedData(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) throw new Error("The file appears to be empty.");

        const trainings = parseRows(rows);

        if (trainings.length === 0)
          throw new Error("No valid training rows found. Make sure the 'Training Name' column exists.");

        setPreviewRows(trainings.slice(0, 5));
        setParsedData(trainings);
        setIsUploading(false);
        setUploadStatus("preview");
      } catch (err) {
        setIsUploading(false);
        setUploadStatus("error");
        setErrorMsg(err.message || "Failed to parse file.");
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadStatus("error");
      setErrorMsg("Could not read the file.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };

  /* ── Confirm upload ────────────────────────────────────────────────────── */
  const handleConfirm = () => {
    if (!parsedData) return;
    setUploadStatus("success");
    if (onUploadSuccess) onUploadSuccess(parsedData);
    setTimeout(() => setUploadStatus(null), 2500);
  };

  /* ── Reset ─────────────────────────────────────────────────────────────── */
  const handleReset = () => {
    setUploadStatus(null);
    setErrorMsg("");
    setPreviewRows([]);
    setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto themed-scroll">

      {/* ── Header ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-blue-500" />
          Bulk Upload Schedule
        </h3>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
          Upload a CSV or Excel file — dates in the file will be used directly for the training schedule.
        </p>
      </div>

      {/* ── Step 1: Download Template ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-4 flex flex-col gap-3">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
          Step 1 · Get Template
        </span>
        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
          Download the template. Fill in your training names &amp; <strong>dates</strong> — those dates will appear on the calendar.
        </p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-[11px] font-bold
            border border-slate-200 dark:border-slate-700/50
            bg-white dark:bg-slate-800/50
            text-slate-600 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-800
            hover:border-blue-300 dark:hover:border-blue-700
            hover:text-blue-600 dark:hover:text-blue-400
            transition-all duration-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download Template (.csv)
        </button>

        {/* Column guide */}
        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
          {[
            ["Training Name", "Required"],
            ["Start Date", "YYYY-MM-DD"],
            ["End Date", "YYYY-MM-DD"],
            ["Start Time", "HH:MM"],
            ["End Time", "HH:MM"],
            ["Location", "Optional"],
            ["Designation", "Optional"],
          ].map(([col, hint]) => (
            <div key={col} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                {col} <span className="text-slate-400 font-normal">({hint})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 2: Upload File ── */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
          Step 2 · Upload Your File
        </span>

        {/* Drop Zone */}
        {uploadStatus !== "preview" && uploadStatus !== "success" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              rounded-2xl border-2 border-dashed flex flex-col items-center justify-center
              text-center transition-all duration-200 min-h-[160px] p-6
              ${isDragging
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : uploadStatus === "error"
                  ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/20"
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Parsing file…</p>
              </>
            ) : uploadStatus === "error" ? (
              <>
                <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Upload Failed</p>
                <p className="text-[10px] text-red-500 mb-3 max-w-[200px] leading-relaxed">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <UploadCloud
                  className={`w-8 h-8 mb-3 transition-colors ${isDragging ? "text-blue-500" : "text-slate-300 dark:text-slate-600"}`}
                />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Drag &amp; drop file here
                </p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-4">
                  Supports .csv, .xlsx, .xls
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-xl text-[11px] font-bold
                    bg-blue-600 hover:bg-blue-700
                    text-white shadow-sm shadow-blue-500/20
                    transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Preview Table ── */}
        {uploadStatus === "preview" && parsedData && (
          <div className="flex flex-col gap-3">
            {/* Summary badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {parsedData.length} training{parsedData.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Mini preview rows */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 grid grid-cols-[1fr_auto] gap-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Training</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Date</span>
              </div>
              {previewRows.map((row, i) => (
                <div key={i} className="px-3 py-2 grid grid-cols-[1fr_auto] gap-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{row.title}</span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.fromDate}</span>
                </div>
              ))}
              {parsedData.length > 5 && (
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 text-center">
                  + {parsedData.length - 5} more rows
                </div>
              )}
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl text-sm font-bold
                bg-blue-600 hover:bg-blue-700 text-white
                shadow-md shadow-blue-500/20
                transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              ✓ Add {parsedData.length} Training{parsedData.length !== 1 ? "s" : ""} to Calendar
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {uploadStatus === "success" && (
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 flex flex-col items-center justify-center min-h-[140px] p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Schedule Updated!
            </p>
            <p className="text-[10px] text-emerald-500 mt-1">
              Trainings added to calendar with the dates from your file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
