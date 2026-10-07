import Link from "next/link";
import { User, Activity, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Welcome to CareFlow
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Please select a role to access the corresponding dashboard. This simulates a login process for our three distinct user types.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Link href="/admin/dashboard" className="group">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 h-full">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">HR Head</h3>
                <p className="text-sm text-slate-500 mt-2">Manage doctors, patients, and global system settings.</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/supervisor/dashboard" className="group">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 h-full">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dept Head</h3>
                <p className="text-sm text-slate-500 mt-2">Oversee staff schedules, appointments, and hospital reports.</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/user/dashboard" className="group">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 h-full">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Standard User</h3>
                <p className="text-sm text-slate-500 mt-2">View your personal dashboard, appointments, and prescriptions.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
