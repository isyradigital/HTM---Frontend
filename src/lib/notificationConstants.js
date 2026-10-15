// Initial default notifications per user role/ID
export const DEFAULT_NOTIFICATIONS = {
  "hr-head": [
    {
      id: "notif-hr-1",
      title: "New Training Request",
      message: "Cardiology department submitted a request for Advanced Cardiac Life Support (ACLS) training.",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
      isRead: false,
      link: "/hr-head/training-requests",
      category: "training"
    },
    {
      id: "notif-hr-2",
      title: "Course Completion Report",
      message: "18 staff members completed 'Infection Control Protocol 2026' module.",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      isRead: false,
      link: "/hr-head/courses",
      category: "courses"
    },
    {
      id: "notif-hr-3",
      title: "License Expiry Alert",
      message: "Dr. Rajesh Sharma's medical practitioner compliance certification expires in 14 days.",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      link: "/hr-head/staff",
      category: "compliance"
    }
  ],
  "dept-head-icu": [
    {
      id: "notif-dh-1",
      title: "Shift Training Pending",
      message: "3 nurses in Night Shift ICU haven't finished Emergency Ventilator Protocol.",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isRead: false,
      link: "/dept-head/trainings",
      category: "training"
    },
    {
      id: "notif-dh-2",
      title: "Department Roster Approved",
      message: "Next week's ICU clinical duty roster has been verified by HR Administration.",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: false,
      link: "/dept-head/schedule",
      category: "system"
    }
  ],
  "dept-head-cardiology": [
    {
      id: "notif-dhc-1",
      title: "Training Slot Confirmed",
      message: "Advanced Cath Lab simulation workshop scheduled for Oct 22nd at 10:00 AM.",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      isRead: false,
      link: "/dept-head-cardiology",
      category: "training"
    }
  ],
  "user-WF001": [
    {
      id: "notif-u-1",
      title: "New Mandatory Course Assigned",
      message: "You have been assigned 'Hospital Safety & Fire Drill 2026'. Due in 5 days.",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false,
      link: "/user/my-learning",
      category: "courses"
    },
    {
      id: "notif-u-2",
      title: "Assessment Cleared",
      message: "Congratulations! You scored 95% in Hand Hygiene & Sterilization Quiz.",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      isRead: true,
      link: "/user/certificates",
      category: "assessment"
    }
  ]
};

// Helper to resolve the correct storage key per user context
export function getNotificationStorageKey(userRole, userId) {
  if (userRole === "user") {
    return `hospital_notifs_user_${userId || "WF001"}`;
  }
  if (userRole === "dept-head") {
    return `hospital_notifs_dept_icu`;
  }
  if (userRole === "dept-head-cardiology") {
    return `hospital_notifs_dept_cardio`;
  }
  return `hospital_notifs_hr_head`;
}

// Helper to resolve fallback notifications per role
export function getInitialNotifications(userRole, userId) {
  if (userRole === "user") {
    return DEFAULT_NOTIFICATIONS[`user-${userId || "WF001"}`] || DEFAULT_NOTIFICATIONS["user-WF001"];
  }
  if (userRole === "dept-head") {
    return DEFAULT_NOTIFICATIONS["dept-head-icu"] || [];
  }
  if (userRole === "dept-head-cardiology") {
    return DEFAULT_NOTIFICATIONS["dept-head-cardiology"] || [];
  }
  return DEFAULT_NOTIFICATIONS["hr-head"] || [];
}
