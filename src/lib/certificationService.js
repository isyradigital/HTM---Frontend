// Centralized persistence utility for Certification Management & Tracking
// Storage key: "hospital_certifications"

export const INITIAL_CERTIFICATES = [
  {
    id: "CERT-MED-101",
    certificateNo: "HOSP-MED-2026-001",
    courseId: 1,
    courseTitle: "Junior Medical Programs",
    courseCode: "MED-101",
    staffId: "WF001",
    staffName: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant",
    category: "Clinical Care",
    badgeLabel: "10%",
    typeTag: "100% Complete",
    validity: "0₽",
    validitySubtext: "10% of budget",
    footnote: "until you open an ad worth 10,000",
    issueDate: "2026-10-04",
    expiryDate: "2028-10-04",
    status: "Active", // "Active" | "Pending Approval" | "Expired" | "Revoked"
    appliedAt: "2026-10-04",
    approvedBy: "HR Department",
    score: 95,
    features: [
      "Unlimited advertising",
      "Pay as you use it",
      "Any number of stores"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-SUR-201",
    certificateNo: "HOSP-SUR-2026-002",
    courseId: 2,
    courseTitle: "Advanced Surgical Programs",
    courseCode: "SUR-201",
    staffId: "WF003",
    staffName: "Dr. Anil Verma",
    department: "Orthopaedics",
    designation: "Consultant",
    category: "Surgery",
    badgeLabel: "fix",
    typeTag: "Mastery",
    validity: "0₽",
    validitySubtext: "20,000 P/month",
    footnote: "until you open an ad worth 10,000",
    issueDate: "2026-09-18",
    expiryDate: "2029-09-18",
    status: "Active",
    appliedAt: "2026-09-15",
    approvedBy: "Chief Medical Officer",
    score: 98,
    features: [
      "Campaigns with a budget of up to RUB 1 million per month",
      "SEO assistant",
      "4 stores (API)"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-NUR-100",
    certificateNo: "HOSP-NUR-2026-003",
    courseId: 3,
    courseTitle: "Adult Care Programs",
    courseCode: "NUR-100",
    staffId: "WF004",
    staffName: "Nurse Sunita Rao",
    department: "ICU",
    designation: "Senior Nurse",
    category: "Nursing",
    badgeLabel: "Specialist",
    typeTag: "Clinical",
    validity: "1 Year",
    issueDate: "2026-10-10",
    expiryDate: "2027-10-10",
    status: "Active",
    appliedAt: "2026-10-09",
    approvedBy: "Nursing Superintendent",
    score: 92,
    features: [
      "ICU Bedridden Repositioning Protocols",
      "Hygiene & Medication Management",
      "Pressure Ulcer Prevention Guidelines",
      "Vital Signs Triage Escalation"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-ER-500",
    certificateNo: "HOSP-ER-2026-004",
    courseId: 4,
    courseTitle: "Emergency Protocols",
    courseCode: "ER-500",
    staffId: "WF006",
    staffName: "Dr. Suresh Patil",
    department: "Emergency Medicine",
    designation: "Medical Officer",
    category: "Emergency",
    badgeLabel: "Critical",
    typeTag: "Life Support",
    validity: "2 Years",
    issueDate: "2026-08-20",
    expiryDate: "2028-08-20",
    status: "Active",
    appliedAt: "2026-08-18",
    approvedBy: "Head of Emergency",
    score: 90,
    features: [
      "ABCDE Trauma Resuscitation Protocol",
      "Immediate Triage Dispatch Control",
      "Medico-Legal Real-time Case Documentation"
    ],
    verified: true,
    certificateUrl: "#"
  }
];

const STORAGE_KEY = "hospital_certifications";

export function getCertifications() {
  if (typeof window === "undefined") return INITIAL_CERTIFICATES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed = JSON.parse(data);
    // If old schema without footnote, update with new INITIAL_CERTIFICATES
    if (parsed.length > 0 && !parsed[0].footnote) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading certifications from storage:", e);
    return INITIAL_CERTIFICATES;
  }
}

export function saveCertifications(certs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
    window.dispatchEvent(new CustomEvent("hospital_certifications_updated", { detail: certs }));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error saving certifications:", e);
  }
}

export function createCertification(certData) {
  const all = getCertifications();
  const newCert = {
    id: `CERT-${Date.now()}`,
    certificateNo: `HOSP-${certData.courseCode || "GEN"}-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, "0")}`,
    appliedAt: new Date().toISOString().split("T")[0],
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split("T")[0], // 2 years default
    status: certData.status || "Active",
    badgeLabel: certData.badgeLabel || "Certified",
    typeTag: certData.typeTag || "Standard",
    validity: certData.validity || "2 Years",
    features: certData.features || [
      "Hospital Verified Curriculum",
      "100% Course Modules Completed",
      "Accredited Medical Training"
    ],
    verified: true,
    ...certData
  };

  const updated = [newCert, ...all];
  saveCertifications(updated);
  return newCert;
}

export function updateCertificationStatus(certId, newStatus) {
  const all = getCertifications();
  const updated = all.map(c => c.id === certId ? { ...c, status: newStatus } : c);
  saveCertifications(updated);
  return updated;
}
