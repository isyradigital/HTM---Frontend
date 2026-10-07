"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Users, Calendar, Clock, UserCircle } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHIFTS = [
  { label: "Morning", time: "6 AM – 2 PM", color: "#3b82f6" },
  { label: "Afternoon", time: "2 PM – 10 PM", color: "#f59e0b" },
  { label: "Night", time: "10 PM – 6 AM", color: "#8b5cf6" },
];

const MOCK_STAFF = [
  { name: "Dr. Sharma", role: "Cardiologist", shifts: [0, 0, 1, 1, 2, null] },
  { name: "Dr. Patel", role: "Neurologist", shifts: [1, 2, 0, null, 0, 1] },
  { name: "Nurse Priya", role: "ICU Nurse", shifts: [2, 2, null, 0, 1, 0] },
  { name: "Nurse Ravi", role: "Ward Nurse", shifts: [0, 1, 1, 2, null, 2] },
  { name: "Dr. Mehta", role: "Orthopedic", shifts: [null, 0, 2, 1, 1, 0] },
];

export default function StaffSchedulePage() {
  return (
    <div className="min-h-full w-full h-full overflow-y-auto space-y-6">
      <PageHeader title="Staff Schedule" description="Weekly shift schedule for hospital staff." />

      {/* ─── Legend ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        {SHIFTS.map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.label}</span>
            <span className="text-[10px] text-slate-400 font-medium">{s.time}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Off</span>
        </div>
      </div>

      {/* ─── Schedule Table ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Weekly Roster
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">This week's shift assignments.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[220px]">Staff Member</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {MOCK_STAFF.map((staff, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 flex items-center justify-center font-bold text-sm">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.role}</p>
                      </div>
                    </div>
                  </td>
                  {staff.shifts.map((shiftIdx, dayIdx) => (
                    <td key={dayIdx} className="px-4 py-4 text-center">
                      {shiftIdx !== null ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border"
                          style={{
                            backgroundColor: `${SHIFTS[shiftIdx].color}10`,
                            borderColor: `${SHIFTS[shiftIdx].color}30`,
                            color: SHIFTS[shiftIdx].color,
                          }}
                        >
                          <Clock className="w-3 h-3" />
                          {SHIFTS[shiftIdx].label}
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                          Off
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
