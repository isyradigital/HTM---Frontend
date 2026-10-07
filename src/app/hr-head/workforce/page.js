"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  Users,
  Search,
  Database,
  Info,
  Stethoscope,
  Building2,
  BadgeCheck,
  Filter,
  ChevronDown
} from "lucide-react";
import workforceData from "./workforce-data.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Status badge helper ─────────────────────────────────────── */
const STATUS_STYLES = {
  Active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
  "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
};

/* ── Avatar initials color cycle (theme-consistent) ─────────── */
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

export default function WorkforcePage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [desigFilter, setDesigFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");

  const departments = ["All", ...new Set(workforceData.map(d => d.department))];
  const designations = ["All", ...new Set(workforceData.map(d => d.designation))];
  const specialities = ["All", ...new Set(workforceData.map(d => d.speciality))];

  const filtered = workforceData.filter((s) => {
    const matchesSearch = [s.name, s.department, s.designation, s.speciality].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    const matchesDept = deptFilter === "All" || s.department === deptFilter;
    const matchesDesig = desigFilter === "All" || s.designation === desigFilter;
    const matchesSpec = specFilter === "All" || s.speciality === specFilter;
    return matchesSearch && matchesDept && matchesDesig && matchesSpec;
  });

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto space-y-6 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <PageHeader
        title="Workforce"
        description="Hospital staff directory — complete workforce overview."
      />

      {/* ── HRMS Source Banner ────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
        <div className="shrink-0 w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Database className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
            Data sourced from HRMS
          </p>
          <p className="text-xs font-medium text-blue-600/80 dark:text-blue-400/70 mt-0.5">
            This workforce directory is automatically synced from the Hospital Human Resource Management System (HRMS). Records shown are read-only. Contact the HRMS administrator for modifications.
          </p>
        </div>
        <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
      </div>

      {/* ── Staff List Card ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col">

        {/* Card Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Staff Directory
              <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                {filtered.length} of {workforceData.length}
              </span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">All active and on-leave hospital personnel.</p>
          </div>

          {/* Actions: Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            
            {/* Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[80px]">
                    {deptFilter === "All" ? "Dept" : deptFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Department</div>
                  {departments.map(dept => (
                    <DropdownMenuItem
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={`px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${deptFilter === dept ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      {dept}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  <span className="truncate max-w-[80px]">
                    {desigFilter === "All" ? "Role" : desigFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Designation</div>
                  {designations.map(desig => (
                    <DropdownMenuItem
                      key={desig}
                      onClick={() => setDesigFilter(desig)}
                      className={`px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${desigFilter === desig ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      {desig}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  <span className="truncate max-w-[80px]">
                    {specFilter === "All" ? "Speciality" : specFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Speciality</div>
                  {specialities.map(spec => (
                    <DropdownMenuItem
                      key={spec}
                      onClick={() => setSpecFilter(spec)}
                      className={`px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${specFilter === spec ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      {spec}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div>
            <table className="w-full text-left whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Department
                    </span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5" /> Designation
                    </span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> Speciality
                    </span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center text-slate-400">
                        <Users className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No staff found</p>
                        <p className="text-xs mt-1">Try a different search term.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((staff, idx) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Name + ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                              {staff.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">{staff.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {staff.department}
                        </p>
                      </td>

                      {/* Designation */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                          {staff.designation}
                        </span>
                      </td>

                      {/* Speciality */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {staff.speciality}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[staff.status] || STATUS_STYLES["Active"]}`}>
                          {staff.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
