"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  HelpCircle 
} from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const confirmResolveRef = useRef(null);

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show a toast notification
  const showToast = useCallback((message, type = "info", options = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const duration = options.duration ?? (type === "error" ? 4500 : 3500);

    const newToast = {
      id,
      message,
      type, // "success" | "error" | "warning" | "info"
      title: options.title,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Toast convenience methods
  const success = useCallback((msg, opts) => showToast(msg, "success", opts), [showToast]);
  const error = useCallback((msg, opts) => showToast(msg, "error", opts), [showToast]);
  const warning = useCallback((msg, opts) => showToast(msg, "warning", opts), [showToast]);
  const info = useCallback((msg, opts) => showToast(msg, "info", opts), [showToast]);

  // Custom Promise-based confirmation modal
  const confirm = useCallback(({
    title = "Are you sure?",
    message = "Do you want to proceed with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning", // "warning" | "danger" | "info"
  }) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
      });
    });
  }, []);

  const handleConfirmAction = (result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmDialog(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, confirm }}>
      {children}

      {/* ── Toaster Container (Top-Right / Mobile Top-Center) ── */}
      <div 
        aria-live="polite" 
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ── Custom Confirmation Modal ── */}
      {confirmDialog && (
        <ConfirmationModal 
          dialog={confirmDialog} 
          onConfirm={() => handleConfirmAction(true)}
          onCancel={() => handleConfirmAction(false)}
        />
      )}
    </ToastContext.Provider>
  );
}

// Hook to access toaster and confirm dialog
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// ── Individual Toast Item ──
function ToastItem({ toast, onClose }) {
  const { type, message, title } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-500 dark:text-emerald-400",
      bgClass: "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 shadow-emerald-500/10",
      accentBar: "bg-emerald-500",
      defaultTitle: "Success",
    },
    error: {
      icon: AlertCircle,
      iconClass: "text-rose-500 dark:text-rose-400",
      bgClass: "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60 shadow-rose-500/10",
      accentBar: "bg-rose-500",
      defaultTitle: "Error",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-500 dark:text-amber-400",
      bgClass: "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 shadow-amber-500/10",
      accentBar: "bg-amber-500",
      defaultTitle: "Warning",
    },
    info: {
      icon: Info,
      iconClass: "text-blue-500 dark:text-blue-400",
      bgClass: "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/60 shadow-blue-500/10",
      accentBar: "bg-blue-600",
      defaultTitle: "Information",
    },
  }[type] || {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    accentBar: "bg-blue-600",
    defaultTitle: "Notification",
  };

  const Icon = typeConfig.icon;

  return (
    <div 
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl relative overflow-hidden backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${typeConfig.bgClass}`}
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeConfig.accentBar}`} />

      {/* Type Icon */}
      <div className="shrink-0 pt-0.5 pl-1">
        <Icon className={`w-5 h-5 ${typeConfig.iconClass}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {title || typeConfig.defaultTitle}
        </h4>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug mt-0.5 break-words">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Custom Confirmation Modal Component ──
function ConfirmationModal({ dialog, onConfirm, onCancel }) {
  const { title, message, confirmText, cancelText, type } = dialog;

  const isDanger = type === "danger" || type === "warning";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDanger 
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" 
              : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          }`}>
            {isDanger ? <AlertTriangle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          </div>
          <div className="space-y-1 min-w-0 flex-1 pt-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
