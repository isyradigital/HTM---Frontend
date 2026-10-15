"use client";

import { Bell, Search, Menu, Moon, Sun, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [standardUser, setStandardUser] = useState({
    id: "WF001",
    name: "Dr. Rajesh Sharma",
    designation: "Senior Consultant",
  });

  // Detect role from current URL path
  let currentRoleLabel = "HR Head";
  let currentUserName = "Mike Nielsen";
  if (pathname.startsWith("/hr-head")) {
    currentRoleLabel = "HR Head";
    currentUserName = "Mike Nielsen";
  } else if (pathname.startsWith("/dept-head")) {
    currentRoleLabel = "Dept Head (ICU)";
    currentUserName = "Sarah Jenkins";
  } else if (pathname.startsWith("/user")) {
    currentRoleLabel = standardUser.designation;
    currentUserName = standardUser.name;
  }

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("current_standard_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!parsed.id) parsed.id = "WF001";
      setStandardUser(parsed);
      localStorage.setItem("current_standard_user", JSON.stringify(parsed));
    }
  }, []);

  return (
    <header className="relative z-30 flex h-[72px] w-full shrink-0 items-center justify-between gap-4 rounded-[2rem] bg-white px-6 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_-4px_rgba(99,102,241,0.25)] dark:hover:shadow-[0_8px_30px_-4px_rgba(99,102,241,0.3)] hover:border-indigo-200 dark:hover:border-indigo-700/50 group">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-all flex items-center justify-center">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>
      
      <div className="flex flex-1 items-center justify-between ml-4">
        <div className="flex max-w-sm flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-500 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-blue-500 transition-all">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input 
            type="text" 
            placeholder="Try to searching ..." 
            className="flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 md:gap-5 ml-4">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative rounded-full p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button className="relative rounded-full p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <Globe className="h-5 w-5" />
          </button>
          
          {/* Global Realtime Notification Bell */}
          <NotificationBell />
          
          <div className="flex items-center gap-3 cursor-pointer group ml-2">
            <Avatar className="h-10 w-10 shadow-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName.replace(" ", "")}`} alt={currentUserName} />
              <AvatarFallback>{currentUserName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{currentUserName}</span>
              <span className="text-[11px] text-slate-500 font-medium">{currentRoleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
