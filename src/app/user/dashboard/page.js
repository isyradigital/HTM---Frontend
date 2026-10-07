import { PageHeader } from "@/components/PageHeader";
import { LayoutDashboard, Calendar, FileText, Activity, Clock, ShieldCheck, HeartPulse, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const KpiCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 h-full">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${color}, transparent)` }} />
      <div className="relative flex items-start justify-between z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shrink-0"
          style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 z-10 bg-blue-600" />
    </div>
  );
};

export default function UserDashboard() {
  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto space-y-6  dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      
      {/* ─── Welcome Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-2">
              <HeartPulse className="w-3.5 h-3.5" />
              Patient Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Welcome Back, <span className="text-blue-600 dark:text-blue-400">Mike</span>! 👋
            </h1>
            <p className="text-slate-500 max-w-2xl text-base">
              Manage your upcoming hospital appointments, view your recent medical prescriptions, and track your health records securely.
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-4 shrink-0">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Upcoming Visits" value="2" subtitle="Next on Thursday" icon={Calendar} color="#3b82f6" />
        <KpiCard title="Active Prescriptions" value="4" subtitle="Medications current" icon={FileText} color="#10b981" />
        <KpiCard title="Health Reports" value="12" subtitle="Lab results ready" icon={Activity} color="#8b5cf6" />
        <KpiCard title="Care Status" value="Active" subtitle="Standard health plan" icon={ShieldCheck} color="#f59e0b" />
      </div>

      {/* ─── Recent Sections ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Cardiology Checkup</p>
                  <p className="text-xs text-slate-500">Dr. Robert Smith • Oct 2, 2026 - 10:00 AM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Prescriptions</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Amoxicillin 500mg</p>
                  <p className="text-xs text-slate-500">Take 1 capsule twice daily • 7 refills left</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
