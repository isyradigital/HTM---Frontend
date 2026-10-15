"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Inbox, 
  ExternalLink, 
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import { useNotifications } from "@/components/NotificationProvider";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell({ className = "" }) {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    currentUserContext, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "unread"
  const popoverRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "unread") return !item.isRead;
    return true;
  });

  const handleNavigate = (link) => {
    setIsOpen(false);
    if (link) {
      router.push(link);
    }
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Trigger Button with Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative rounded-full p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 outline-none"
      >
        <Bell className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
        
        {/* Dynamic Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm animate-in zoom-in-75 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Glassmorphic Popover Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                  <p className="text-[10px] font-medium text-slate-400">
                    Logged in as: <span className="font-semibold text-slate-600 dark:text-slate-300">{currentUserContext.name}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    title="Clear all"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setActiveFilter("all")}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  activeFilter === "all"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter("unread")}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  activeFilter === "unread"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {activeFilter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  We'll notify you when an update arrives.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Realtime synced
            </span>
            <span>{notifications.length} total updates</span>
          </div>
        </div>
      )}
    </div>
  );
}
