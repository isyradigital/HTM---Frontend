import React from "react";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  Clock 
} from "lucide-react";

export function NotificationItem({ notification, onRead, onRemove, onNavigate }) {
  const { id, title, message, type, timestamp, isRead, link, category } = notification;

  // Icon selector based on type or category
  const renderIcon = () => {
    switch (category) {
      case "courses":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "assessment":
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "training":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "compliance":
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      default:
        switch (type) {
          case "success":
            return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          case "warning":
            return <AlertTriangle className="w-4 h-4 text-amber-500" />;
          case "error":
            return <AlertCircle className="w-4 h-4 text-rose-500" />;
          default:
            return <Info className="w-4 h-4 text-blue-500" />;
        }
    }
  };

  // Human friendly time format
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const handleClick = () => {
    if (!isRead && onRead) {
      onRead(id);
    }
    if (link && onNavigate) {
      onNavigate(link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
        isRead
          ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent text-slate-600 dark:text-slate-400"
          : "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border-blue-100/60 dark:border-blue-900/30 text-slate-800 dark:text-slate-200"
      }`}
    >
      {/* Unread indicator dot */}
      {!isRead && (
        <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/40" />
      )}

      {/* Type / Category Icon badge */}
      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
        isRead
          ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60"
          : "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-sm"
      }`}>
        {renderIcon()}
      </div>

      {/* Notification Text Details */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4 className={`text-xs font-bold truncate leading-snug ${
            isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
          }`}>
            {title}
          </h4>
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            <Clock className="w-2.5 h-2.5" />
            {formatTime(timestamp)}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed line-clamp-2 text-slate-500 dark:text-slate-400">
          {message}
        </p>
      </div>

      {/* Delete / Dismiss on hover button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          title="Remove"
        >
          <span className="text-xs font-semibold leading-none">&times;</span>
        </button>
      )}
    </div>
  );
}
