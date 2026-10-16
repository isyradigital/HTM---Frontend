// Centralized persistence utility for Certification Management & Tracking
// Storage key: "hospital_certifications"

export const INITIAL_CERTIFICATES = [
  {
    id: "CERT-MED-101",
    certificateNo: "HOSP-MED-2026-001",
    courseId: 1,
    courseTitle: "Junior Medical Residency",
    courseCode: "MED-101",
    staffId: "WF001",
    staffName: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant",
    category: "Clinical Care",
    validity: "2 Years",
    validitySubtext: "Clinical Credential",
    footnote: "Valid until 2028-10-04",
    issueDate: "2026-10-04",
    expiryDate: "2028-10-04",
    status: "Active",
    appliedAt: "2026-10-04",
    approvedBy: "Medical Council",
    score: 95,
    description: "Accredited clinical residency competency in primary survey, bedside diagnostic protocols, and emergency cardio-pulmonary stabilization.",
    features: [
      "Primary Patient Survey & ABCDE Triage",
      "Core Inpatient Bedside Diagnostics",
      "Standard Medico-Legal Documentation",
      "Senior Consultant Escalation Pathways"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-SUR-201",
    certificateNo: "HOSP-SUR-2026-002",
    courseId: 2,
    courseTitle: "Advanced Surgical Operative",
    courseCode: "SUR-201",
    staffId: "WF003",
    staffName: "Dr. Anil Verma",
    department: "Orthopaedics",
    designation: "Consultant",
    category: "Surgery",
    validity: "3 Years",
    validitySubtext: "Operative Privilege",
    footnote: "Valid until 2029-09-18",
    issueDate: "2026-09-18",
    expiryDate: "2029-09-18",
    status: "Active",
    appliedAt: "2026-09-15",
    approvedBy: "Surgical Governance Board",
    score: 98,
    description: "Certified surgical competency in advanced laparoscopic procedures, intraoperative patient safety, and tissue management.",
    features: [
      "Advanced Laparoscopic Instrumentation",
      "Intraoperative Hemostasis & Suturing",
      "WHO Surgical Safety Checklist Compliance",
      "Post-Operative Critical Care Rounds"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-NUR-100",
    certificateNo: "HOSP-NUR-2026-003",
    courseId: 3,
    courseTitle: "Critical Care Nursing",
    courseCode: "NUR-100",
    staffId: "WF004",
    staffName: "Nurse Sunita Rao",
    department: "ICU",
    designation: "Senior Nurse",
    category: "Nursing",
    validity: "1 Year",
    validitySubtext: "ICU Certified",
    footnote: "Valid until 2027-10-10",
    issueDate: "2026-10-10",
    expiryDate: "2027-10-10",
    status: "Active",
    appliedAt: "2026-10-09",
    approvedBy: "Nursing Superintendent",
    score: 92,
    description: "Certified proficiency in intensive care vital signs monitoring, invasive line maintenance, and critical medication administration.",
    features: [
      "Invasive Hemodynamic Monitoring",
      "Mechanical Ventilation Airway Care",
      "High-Alert IV Medication Protocols",
      "Pressure Injury Triage & Prevention"
    ],
    verified: true,
    certificateUrl: "#"
  },
  {
    id: "CERT-ER-500",
    certificateNo: "HOSP-ER-2026-004",
    courseId: 4,
    courseTitle: "Emergency Trauma Protocol",
    courseCode: "ER-500",
    staffId: "WF006",
    staffName: "Dr. Suresh Patil",
    department: "Emergency Medicine",
    designation: "Medical Officer",
    category: "Emergency",
    validity: "2 Years",
    validitySubtext: "Trauma Accredited",
    footnote: "Valid until 2028-08-20",
    issueDate: "2026-08-20",
    expiryDate: "2028-08-20",
    status: "Active",
    appliedAt: "2026-08-18",
    approvedBy: "Emergency Services Director",
    score: 90,
    description: "Certified qualification in Advanced Trauma Life Support (ATLS), rapid sequence intubation, and disaster triage response.",
    features: [
      "Advanced Cardiac & Trauma Resuscitation",
      "Rapid Sequence Intubation (RSI) Protocol",
      "Mass Casualty Incident (MCI) Triage",
      "Emergency Medico-Legal Case Recording"
    ],
    verified: true,
    certificateUrl: "#"
  }
];

const STORAGE_KEY = "hospital_certifications_v2";

export function getCertifications() {
  if (typeof window === "undefined") return INITIAL_CERTIFICATES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed = JSON.parse(data);
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
    certificateNo: `HOSP-${certData.courseCode || "MED"}-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, "0")}`,
    appliedAt: new Date().toISOString().split("T")[0],
    issueDate: certData.issueDate || new Date().toISOString().split("T")[0],
    expiryDate: certData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split("T")[0],
    status: certData.status || "Active",
    validity: certData.validity || "1 Year",
    validitySubtext: certData.validitySubtext || "Clinical Qualification",
    footnote: certData.footnote || (certData.expiryDate ? `Valid until ${certData.expiryDate}` : "Hospital Verified"),
    features: certData.features || [
      "Hospital Standard Safety Guidelines",
      "Core Competency Assessment Passed",
      "Clinical Protocol Compliance"
    ],
    verified: true,
    ...certData
  };

  const updated = [newCert, ...all];
  saveCertifications(updated);
  return newCert;
}

export function updateCertification(certId, updatedData) {
  const all = getCertifications();
  let updatedCert = null;
  const updated = all.map(c => {
    if (c.id === certId) {
      updatedCert = { ...c, ...updatedData };
      return updatedCert;
    }
    return c;
  });
  saveCertifications(updated);
  return updatedCert;
}

export function deleteCertification(certId) {
  const all = getCertifications();
  const updated = all.filter(c => c.id !== certId);
  saveCertifications(updated);
  return updated;
}

export function renewCertification(certId, renewalData = {}) {
  const all = getCertifications();
  const target = all.find(c => c.id === certId);
  if (!target) return null;

  const today = new Date();
  let expiry = "";
  const validityPeriod = renewalData.validity || "1 Year";

  if (validityPeriod === "3 Months") {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    expiry = d.toISOString().split("T")[0];
  } else if (validityPeriod === "6 Months") {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 6);
    expiry = d.toISOString().split("T")[0];
  } else if (validityPeriod === "1 Year") {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 1);
    expiry = d.toISOString().split("T")[0];
  } else if (validityPeriod === "3 Years") {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 3);
    expiry = d.toISOString().split("T")[0];
  } else if (validityPeriod === "Custom Date" && renewalData.customDate) {
    expiry = renewalData.customDate;
  } else if (renewalData.expiryDate) {
    expiry = renewalData.expiryDate;
  } else {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 1);
    expiry = d.toISOString().split("T")[0];
  }

  const issueDateStr = today.toISOString().split("T")[0];
  
  let finalValidity = validityPeriod;
  if (validityPeriod === "Custom Date") {
    if (expiry) {
      const now = new Date();
      now.setHours(0,0,0,0);
      const targetDate = new Date(expiry);
      targetDate.setHours(0,0,0,0);
      const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) finalValidity = "Expired";
      else if (diffDays === 0) finalValidity = "Expires Today";
      else if (diffDays === 1) finalValidity = "1 Day";
      else if (diffDays <= 90) finalValidity = `${diffDays} Days`;
      else {
        const months = Math.round(diffDays / 30);
        if (months < 12) finalValidity = `${months} Months`;
        else {
          const years = (diffDays / 365).toFixed(1).replace(".0", "");
          finalValidity = `${years} Year${years === "1" ? "" : "s"}`;
        }
      }
    } else {
      finalValidity = "Custom";
    }
  }

  const renewedCert = {
    ...target,
    ...renewalData,
    issueDate: issueDateStr,
    expiryDate: expiry,
    validity: finalValidity,
    validitySubtext: `Renewed ${issueDateStr}`,
    footnote: expiry ? `Valid until ${expiry}` : `Renewed ${finalValidity}`,
    status: "Active",
    renewalHistory: [
      ...(target.renewalHistory || []),
      {
        renewedAt: issueDateStr,
        previousExpiry: target.expiryDate,
        newExpiry: expiry,
        validity: finalValidity,
        notes: renewalData.notes || "Accreditation renewal approved"
      }
    ]
  };

  const updated = all.map(c => c.id === certId ? renewedCert : c);
  saveCertifications(updated);
  return renewedCert;
}

export function updateCertificationStatus(certId, newStatus) {
  const all = getCertifications();
  const updated = all.map(c => c.id === certId ? { ...c, status: newStatus } : c);
  saveCertifications(updated);
  return updated;
}

