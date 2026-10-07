import { LayoutDashboard, Users, CalendarCheck, FileText, ArrowUpRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 h-full">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${color}, transparent)` }} />
      <div className="relative flex items-start justify-between z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600")}>
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
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

export default function SupervisorDashboard() {
  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto space-y-6 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      
      {/* ─── Welcome Banner (Hospital Style) ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dept Head Module
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Welcome to Dept Head Dashboard, <span className="text-blue-600 dark:text-blue-400">Sarah</span>! 👋
            </h1>
            <p className="text-slate-500 max-w-2xl text-base">
              Live monitoring: Staff Rosters, Appointments, Training Requests & Reports all in one place.
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-4 shrink-0">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Staff" value="28" subtitle="On duty right now" icon={Users} color="#3b82f6" trend="up" trendValue="Fully staffed" />
        <KpiCard title="Today's Appointments" value="142" subtitle="Scheduled for today" icon={CalendarCheck} color="#10b981" />
        <KpiCard title="Training Requests" value="15" subtitle="Pending approval" icon={GraduationCap} color="#f59e0b" />
        <KpiCard title="Reports Generated" value="8" subtitle="System analytics" icon={FileText} color="#8b5cf6" trend="up" trendValue="+3 today" />
      </div>

    </div>
  );
}
