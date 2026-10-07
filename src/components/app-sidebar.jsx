"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Calendar, LayoutDashboard, Settings, Users, UserPlus, Pill, Bed, FileText, ChevronDown, HeartPulse, LogOut, CalendarX2, CheckCheck, ChartColumnIncreasing } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ROLES = {
  admin: {
    userName: "Mike Nielsen",
    label: "HR Head",
    dashboardUrl: "/hr-head/dashboard",
    menus: [
      { title: "Dashboard", url: "/hr-head/dashboard", icon: LayoutDashboard },
      { title: "Workforce", url: "/hr-head/workforce", icon: Users },
      { title: "Trainings", url: "/hr-head/training", icon: Users },
      { title: "Training Calendar", url: "/hr-head/training-calendar", icon: Calendar },
      { title: "Courses", url: "/hr-head/courses", icon: ChartColumnIncreasing },
    ],
  },
  supervisor: {
    userName: "Sarah Jenkins",
    label: "Dept Head (ICU)",
    dashboardUrl: "/dept-head/dashboard",
    menus: [
      { title: "Dashboard", url: "/dept-head/dashboard", icon: LayoutDashboard },
      { title: "Training Calendar", url: "/dept-head/training-calendar", icon: Calendar },
      { title: "Training requests", url: "/dept-head/training-requests", icon: CheckCheck },
    ],
  },
  cardiology: {
    userName: "Dr. Rahul Mehta",
    label: "Dept Head (Cardiology)",
    dashboardUrl: "/dept-head-cardiology/dashboard",
    menus: [
      { title: "Dashboard", url: "/dept-head-cardiology/dashboard", icon: LayoutDashboard },
      { title: "Training Calendar", url: "/dept-head-cardiology/training-calendar", icon: Calendar },
    ],
  },
  user: {
    userName: "John Doe",
    label: "Standard User",
    dashboardUrl: "/user/dashboard",
    menus: [
      { title: "My Dashboard", url: "/user/dashboard", icon: LayoutDashboard },
      { title: "Trainings", url: "/user/training", icon: Calendar },
      { title: "Courses", url: "/user/courses", icon: ChartColumnIncreasing },
    ],
  },
};

export function AppSidebar() {
  const pathname = usePathname();

  // Detect role from current URL path
  let currentRole = "admin"; // default = HR Head
  if (pathname.startsWith("/hr-head")) currentRole = "admin";
  else if (pathname.startsWith("/dept-head-cardiology")) currentRole = "cardiology";
  else if (pathname.startsWith("/dept-head")) currentRole = "supervisor";
  else if (pathname.startsWith("/user")) currentRole = "user";

  const currentRoleData = ROLES[currentRole];

  return (
    <Sidebar collapsible="icon" className="border-none bg-transparent pt-3 pl-3 pb-3">
      <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all duration-300">
        <SidebarHeader className="p-8 pb-4 group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:pt-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white truncate">C Care</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-6 py-4 group-data-[collapsible=icon]:px-3 flex-1 overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden">
              HOME
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {currentRoleData.menus.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} className="flex items-center gap-4 group-data-[collapsible=icon]:gap-0" />}
                        isActive={isActive}
                        className={`rounded-full px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-300 font-medium ${isActive
                          ? "bg-blue-100/80 text-blue-600 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                          }`}
                      >
                        <item.icon className={`h-[22px] w-[22px] shrink-0 ${isActive ? "text-blue-600 bg-blue-100 dark:text-blue-400" : "text-slate-700"}`} />
                        <span className="text-[15px] group-data-[collapsible=icon]:hidden truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 pt-2 group-data-[collapsible=icon]:p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-2xl bg-[#f4f7fa] dark:bg-slate-800/80 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:bg-transparent cursor-pointer outline-none">
              <Avatar className="h-10 w-10 shrink-0 shadow-sm border border-white">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRoleData.userName.replace(" ", "")}`} alt={currentRoleData.userName} />
                <AvatarFallback>{currentRoleData.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-bold text-slate-800 dark:text-white">
                  {currentRoleData.userName}
                </span>
                <span className="truncate text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  {currentRoleData.label}
                </span>
              </div>
              <LogOut className="h-5 w-5 shrink-0 text-blue-500 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-[240px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800">
              <div className="mb-2 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-700/50 pt-1">
                Switch Role
              </div>
              {Object.keys(ROLES).map((roleKey) => (
                <Link key={roleKey} href={ROLES[roleKey].dashboardUrl}>
                  <DropdownMenuItem
                    className={`rounded-xl cursor-pointer px-3 py-2 flex flex-col items-start gap-0.5 transition-colors ${currentRole === roleKey ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`text-sm font-bold ${currentRole === roleKey ? 'text-blue-700' : 'text-slate-700 dark:text-slate-200'}`}>
                      {ROLES[roleKey].userName}
                    </span>
                    <span className={`text-[10px] font-medium ${currentRole === roleKey ? 'text-blue-500' : 'text-slate-500'}`}>
                      {ROLES[roleKey].label}
                    </span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
