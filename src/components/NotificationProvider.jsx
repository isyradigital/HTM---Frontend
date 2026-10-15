"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getNotificationStorageKey, getInitialNotifications } from "@/lib/notificationConstants";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const pathname = usePathname();
  const [currentUserContext, setCurrentUserContext] = useState({
    role: "hr-head",
    id: "HR001",
    name: "Mike Nielsen"
  });
  const [notifications, setNotifications] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Detect current logged-in role and user identity based on URL and localStorage
  const detectUserContext = useCallback(() => {
    let role = "hr-head";
    let id = "HR001";
    let name = "Mike Nielsen";

    if (pathname.startsWith("/dept-head-cardiology")) {
      role = "dept-head-cardiology";
      id = "DH_CARDIO";
      name = "Dr. Amit Patel";
    } else if (pathname.startsWith("/dept-head")) {
      role = "dept-head";
      id = "DH_ICU";
      name = "Sarah Jenkins";
    } else if (pathname.startsWith("/user")) {
      role = "user";
      id = "WF001";
      name = "Dr. Rajesh Sharma";
      try {
        const storedUser = localStorage.getItem("current_standard_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.id) id = parsed.id;
          if (parsed.name) name = parsed.name;
        }
      } catch (e) {
        console.error("Error reading current_standard_user", e);
      }
    }

    return { role, id, name };
  }, [pathname]);

  // 2. Load notifications when the user or route changes
  useEffect(() => {
    const user = detectUserContext();
    setCurrentUserContext(user);

    const storageKey = getNotificationStorageKey(user.role, user.id);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const defaults = getInitialNotifications(user.role, user.id);
        setNotifications(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
    } catch (e) {
      console.error("Error reading notifications from localStorage", e);
      setNotifications(getInitialNotifications(user.role, user.id));
    }
    setIsInitialized(true);
  }, [detectUserContext]);

  // 3. Save notifications to localStorage when changed
  const saveToStorage = useCallback((updatedNotifs, userContextOverride = null) => {
    const ctx = userContextOverride || currentUserContext;
    const storageKey = getNotificationStorageKey(ctx.role, ctx.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedNotifs));
      // Dispatch custom window event so any other open components/tabs update in realtime
      window.dispatchEvent(new CustomEvent("hospital_notification_updated", {
        detail: { key: storageKey, notifications: updatedNotifs }
      }));
    } catch (e) {
      console.error("Error saving notifications to localStorage", e);
    }
  }, [currentUserContext]);

  // Realtime multi-window / multi-tab cross-listener
  useEffect(() => {
    const handleStorageOrCustom = (e) => {
      const storageKey = getNotificationStorageKey(currentUserContext.role, currentUserContext.id);
      if (e.type === "storage" && e.key === storageKey) {
        try {
          if (e.newValue) setNotifications(JSON.parse(e.newValue));
        } catch (err) {}
      } else if (e.type === "hospital_notification_updated" && e.detail?.key === storageKey) {
        setNotifications(e.detail.notifications);
      }
    };

    window.addEventListener("storage", handleStorageOrCustom);
    window.addEventListener("hospital_notification_updated", handleStorageOrCustom);
    return () => {
      window.removeEventListener("storage", handleStorageOrCustom);
      window.removeEventListener("hospital_notification_updated", handleStorageOrCustom);
    };
  }, [currentUserContext]);

  // 4. Send notification (can target current user or another specific user/role)
  const addNotification = useCallback(({
    title,
    message,
    type = "info", // "info" | "success" | "warning" | "error"
    targetRole,   // optional: "hr-head" | "dept-head" | "user" | "all"
    targetUserId, // optional: specific user ID (e.g. "WF001")
    link = null,
    category = "general"
  }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
      link,
      category
    };

    // Determine target context
    const isTargetingCurrent = 
      (!targetRole && !targetUserId) ||
      (targetRole === currentUserContext.role && (!targetUserId || targetUserId === currentUserContext.id));

    if (isTargetingCurrent) {
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        saveToStorage(next);
        return next;
      });
    } else {
      // Send to another user's isolated storage
      const resolvedRole = targetRole || "user";
      const resolvedUserId = targetUserId || (resolvedRole === "user" ? "WF001" : null);
      const targetStorageKey = getNotificationStorageKey(resolvedRole, resolvedUserId);
      try {
        let existing = [];
        const raw = localStorage.getItem(targetStorageKey);
        if (raw) existing = JSON.parse(raw);
        else existing = getInitialNotifications(resolvedRole, resolvedUserId);
        const updated = [newNotif, ...existing];
        localStorage.setItem(targetStorageKey, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("hospital_notification_updated", {
          detail: { key: targetStorageKey, notifications: updated }
        }));
      } catch (err) {
        console.error("Failed to add notification for other user", err);
      }
    }

    return newNotif;
  }, [currentUserContext, saveToStorage]);

  // 5. Mark single notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 6. Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 7. Delete / Remove a single notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notificationId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 8. Clear all notifications for current user
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    currentUserContext,
    isInitialized,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  }), [
    notifications,
    unreadCount,
    currentUserContext,
    isInitialized,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
