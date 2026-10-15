// Centralized mock and persistence utility for Course Enrollment & Staff Progress Tracking

export const DEFAULT_STAFF_MEMBERS = [
  { id: "WF001", name: "Dr. Rajesh Sharma", department: "Cardiology", designation: "Senior Consultant", avatarSeed: "RajeshSharma" },
  { id: "WF002", name: "Dr. Priya Mehta", department: "Neurology", designation: "Senior Resident (SR)", avatarSeed: "PriyaMehta" },
  { id: "WF003", name: "Dr. Anil Verma", department: "Orthopaedics", designation: "Consultant", avatarSeed: "AnilVerma" },
  { id: "WF004", name: "Nurse Sunita Rao", department: "ICU", designation: "Senior Nurse", avatarSeed: "SunitaRao" },
  { id: "WF005", name: "Dr. Kavita Nair", department: "Gynaecology & Obstetrics", designation: "Junior Resident (JR)", avatarSeed: "KavitaNair" },
  { id: "WF006", name: "Dr. Suresh Patil", department: "Emergency Medicine", designation: "Medical Officer", avatarSeed: "SureshPatil" },
  { id: "WF007", name: "Nurse Rekha Singh", department: "Oncology", designation: "Staff Nurse", avatarSeed: "RekhaSingh" },
  { id: "WF008", name: "Dr. Amit Joshi", department: "General Medicine", designation: "Senior Resident (SR)", avatarSeed: "AmitJoshi" },
  { id: "WF009", name: "Nurse Meenakshi Iyer", department: "ICU", designation: "Staff Nurse", avatarSeed: "MeenakshiIyer" },
  { id: "WF010", name: "Dr. Rohan Kapoor", department: "Cardiology", designation: "Junior Resident (JR)", avatarSeed: "RohanKapoor" },
];

export const INITIAL_ENROLLMENTS = [
  // Course 1: Junior Medical Programs (id: 1)
  {
    id: "enr-1-1",
    courseId: 1,
    courseTitle: "Junior Medical Programs",
    staffId: "WF001",
    staffName: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant",
    enrolledAt: "2026-10-01",
    progress: 100, // percentage
    completedModules: 4,
    totalModules: 4,
    status: "Completed", // "Completed" | "In Progress" | "Not Started"
    completedAt: "2026-10-04",
    score: 95
  },
  {
    id: "enr-1-2",
    courseId: 1,
    courseTitle: "Junior Medical Programs",
    staffId: "WF005",
    staffName: "Dr. Kavita Nair",
    department: "Gynaecology & Obstetrics",
    designation: "Junior Resident (JR)",
    enrolledAt: "2026-10-03",
    progress: 75,
    completedModules: 3,
    totalModules: 4,
    status: "In Progress",
    completedAt: null,
    score: 82
  },
  {
    id: "enr-1-3",
    courseId: 1,
    courseTitle: "Junior Medical Programs",
    staffId: "WF008",
    staffName: "Dr. Amit Joshi",
    department: "General Medicine",
    designation: "Senior Resident (SR)",
    enrolledAt: "2026-10-05",
    progress: 25,
    completedModules: 1,
    totalModules: 4,
    status: "In Progress",
    completedAt: null,
    score: null
  },
  {
    id: "enr-1-4",
    courseId: 1,
    courseTitle: "Junior Medical Programs",
    staffId: "WF010",
    staffName: "Dr. Rohan Kapoor",
    department: "Cardiology",
    designation: "Junior Resident (JR)",
    enrolledAt: "2026-10-10",
    progress: 0,
    completedModules: 0,
    totalModules: 4,
    status: "Not Started",
    completedAt: null,
    score: null
  },

  // Course 2: Advanced Surgical Programs (id: 2)
  {
    id: "enr-2-1",
    courseId: 2,
    courseTitle: "Advanced Surgical Programs",
    staffId: "WF001",
    staffName: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant",
    enrolledAt: "2026-10-02",
    progress: 100,
    completedModules: 2,
    totalModules: 2,
    status: "Completed",
    completedAt: "2026-10-05",
    score: 98
  },
  {
    id: "enr-2-2",
    courseId: 2,
    courseTitle: "Advanced Surgical Programs",
    staffId: "WF003",
    staffName: "Dr. Anil Verma",
    department: "Orthopaedics",
    designation: "Consultant",
    enrolledAt: "2026-10-04",
    progress: 50,
    completedModules: 1,
    totalModules: 2,
    status: "In Progress",
    completedAt: null,
    score: 85
  },

  // Course 3: Adult Care Programs (id: 3)
  {
    id: "enr-3-1",
    courseId: 3,
    courseTitle: "Adult Care Programs",
    staffId: "WF004",
    staffName: "Nurse Sunita Rao",
    department: "ICU",
    designation: "Senior Nurse",
    enrolledAt: "2026-10-02",
    progress: 100,
    completedModules: 2,
    totalModules: 2,
    status: "Completed",
    completedAt: "2026-10-06",
    score: 100
  },
  {
    id: "enr-3-2",
    courseId: 3,
    courseTitle: "Adult Care Programs",
    staffId: "WF007",
    staffName: "Nurse Rekha Singh",
    department: "Oncology",
    designation: "Staff Nurse",
    enrolledAt: "2026-10-08",
    progress: 50,
    completedModules: 1,
    totalModules: 2,
    status: "In Progress",
    completedAt: null,
    score: null
  },

  // Course 4: Emergency Protocols (id: 4)
  {
    id: "enr-4-1",
    courseId: 4,
    courseTitle: "Emergency Protocols",
    staffId: "WF006",
    staffName: "Dr. Suresh Patil",
    department: "Emergency Medicine",
    designation: "Medical Officer",
    enrolledAt: "2026-10-01",
    progress: 100,
    completedModules: 3,
    totalModules: 3,
    status: "Completed",
    completedAt: "2026-10-03",
    score: 94
  },
  {
    id: "enr-4-2",
    courseId: 4,
    courseTitle: "Emergency Protocols",
    staffId: "WF009",
    staffName: "Nurse Meenakshi Iyer",
    department: "ICU",
    designation: "Staff Nurse",
    enrolledAt: "2026-10-06",
    progress: 66,
    completedModules: 2,
    totalModules: 3,
    status: "In Progress",
    completedAt: null,
    score: 88
  }
];

const STORAGE_KEY = "hospital_course_enrollments";

export function getEnrollments() {
  if (typeof window === "undefined") return INITIAL_ENROLLMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENROLLMENTS));
    return INITIAL_ENROLLMENTS;
  } catch (e) {
    console.error("Failed to read enrollments", e);
    return INITIAL_ENROLLMENTS;
  }
}

export function saveEnrollments(enrollments) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
    window.dispatchEvent(new CustomEvent("hospital_enrollments_updated", { detail: enrollments }));
  } catch (e) {
    console.error("Failed to save enrollments", e);
  }
}

export function getEnrollmentsByCourse(courseId) {
  const all = getEnrollments();
  return all.filter(e => String(e.courseId) === String(courseId));
}

export function enrollStaffInCourse({ courseId, courseTitle, staff, totalModules = 4 }) {
  const all = getEnrollments();
  // Check if already enrolled
  const exists = all.some(e => String(e.courseId) === String(courseId) && e.staffId === staff.id);
  if (exists) return { success: false, message: "Staff is already enrolled in this course." };

  const newEnrollment = {
    id: `enr-${courseId}-${Date.now()}`,
    courseId,
    courseTitle,
    staffId: staff.id,
    staffName: staff.name,
    department: staff.department,
    designation: staff.designation,
    enrolledAt: new Date().toISOString().split("T")[0],
    progress: 0,
    completedModules: 0,
    totalModules: totalModules || 4,
    status: "Not Started",
    completedAt: null,
    score: null
  };

  const updated = [newEnrollment, ...all];
  saveEnrollments(updated);
  return { success: true, enrollment: newEnrollment };
}

export function removeStaffEnrollment(enrollmentId) {
  const all = getEnrollments();
  const updated = all.filter(e => e.id !== enrollmentId);
  saveEnrollments(updated);
  return updated;
}

export function updateStaffCourseProgress({ courseId, staffId, completedModules, totalModules }) {
  const all = getEnrollments();
  const safeTotal = totalModules > 0 ? totalModules : 1;
  const progressPercent = Math.min(100, Math.round((completedModules / safeTotal) * 100));

  let status = "Not Started";
  if (progressPercent === 100) {
    status = "Completed";
  } else if (progressPercent > 0) {
    status = "In Progress";
  }

  const updated = all.map(e => {
    if (String(e.courseId) === String(courseId) && e.staffId === staffId) {
      return {
        ...e,
        progress: progressPercent,
        completedModules,
        totalModules: safeTotal,
        status,
        completedAt: progressPercent === 100 ? (e.completedAt || new Date().toISOString().split("T")[0]) : null,
      };
    }
    return e;
  });

  saveEnrollments(updated);
  return updated;
}

