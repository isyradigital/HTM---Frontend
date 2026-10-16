"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Plus, Upload, Award, ShieldCheck, X, FileText, ChevronDown, Calendar, Check,
  Edit3, RefreshCw, Trash2, AlertTriangle, BarChart3, Clock, CheckCircle2,
  XCircle, TrendingUp, ClipboardCheck, Bell, ChevronRight, Printer, Download, Send
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CertificateCard } from "@/components/courses/CertificateCard";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { 
  getCertifications, 
  createCertification, 
  updateCertification,
  deleteCertification,
  renewCertification,
  updateCertificationStatus 
} from "@/lib/certificationService";
import { useToast } from "@/components/ToastProvider";

export function UniversalCertificationView({ initialRole }) {
  const pathname = usePathname();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Detect active role and context automatically from path if not explicitly passed
  const [role, setRole] = useState(initialRole || "user");
  const [activeUser, setActiveUser] = useState({
    id: "WF001",
    name: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant"
  });

  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  // Management Action States: Renew, Delete
  const [renewCert, setRenewCert] = useState(null);
  const [deleteCertConfirm, setDeleteCertConfirm] = useState(null);

  // Staff Renewal Request State
  const [requestRenewalCert, setRequestRenewalCert] = useState(null);
  const [renewalRequestNotes, setRenewalRequestNotes] = useState("");

  // Renewal Form State
  const [renewalForm, setRenewalForm] = useState({
    validity: "1 Year",
    customDate: "",
    notes: ""
  });

  // Form State for "Upload Certificate"
  const [uploadFormData, setUploadFormData] = useState({
    courseTitle: "",
    courseCode: "",
    staffName: "",
    department: "Cardiology",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    fileName: "",
    fileSize: ""
  });

  // Resolve role and logged in user
  useEffect(() => {
    let detectedRole = initialRole;
    if (!detectedRole) {
      if (pathname?.startsWith("/hr-head")) detectedRole = "admin";
      else if (pathname?.startsWith("/dept-head-cardiology")) detectedRole = "cardiology";
      else if (pathname?.startsWith("/dept-head")) detectedRole = "supervisor";
      else detectedRole = "user";
    }
    setRole(detectedRole);

    if (detectedRole === "user") {
      try {
        const saved = localStorage.getItem("current_standard_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setActiveUser(parsed);
        }
      } catch (e) {}
    } else if (detectedRole === "supervisor") {
      setActiveUser({
        id: "dept_head_icu",
        name: "Sarah Jenkins",
        department: "ICU",
        designation: "Dept Head (ICU)"
      });
      setFormData(prev => ({ ...prev, department: "ICU" }));
      setUploadFormData(prev => ({ ...prev, department: "ICU" }));
    } else if (detectedRole === "cardiology") {
      setActiveUser({
        id: "dept_head_cardiology",
        name: "Dr. Rahul Mehta",
        department: "Cardiology",
        designation: "Dept Head (Cardiology)"
      });
      setFormData(prev => ({ ...prev, department: "Cardiology" }));
      setUploadFormData(prev => ({ ...prev, department: "Cardiology" }));
    } else {
      setActiveUser({
        id: "hr_head",
        name: "Mike Nielsen",
        department: "Human Resources",
        designation: "HR Head"
      });
    }
  }, [pathname, initialRole]);

  // Load certifications from storage
  const loadCerts = () => {
    setCertificates(getCertifications());
  };

  useEffect(() => {
    loadCerts();
    const handleUpdate = () => loadCerts();
    window.addEventListener("hospital_certifications_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("hospital_certifications_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Compute scoped list based on role
  const scopedCerts = React.useMemo(() => {
    if (role === "admin") {
      return certificates;
    }
    if (role === "supervisor") {
      return certificates.filter(c => c.department?.toLowerCase() === "icu");
    }
    if (role === "cardiology") {
      return certificates.filter(c => c.department?.toLowerCase() === "cardiology");
    }
    // Standard User sees their own certificates
    return certificates.filter(c => {
      return (
        (c.staffId && c.staffId === activeUser.id) ||
        (c.staffName && c.staffName.toLowerCase() === activeUser.name?.toLowerCase())
      );
    });
  }, [certificates, role, activeUser]);

  const [selectedTrackerFilter, setSelectedTrackerFilter] = useState("all"); // "all" | "active" | "expiring" | "expired"

  // Search and Tracker Filter
  const filteredCerts = scopedCerts.filter(c => {
    // 1. Text Search Filter
    const matchesSearch = 
      c.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateNo?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Certificate Tracker Card Filter
    if (selectedTrackerFilter === "all") return true;

    const toDate = (str) => { const d = new Date(str); d.setHours(0,0,0,0); return d; };
    const todayZero = new Date();
    todayZero.setHours(0,0,0,0);

    if (selectedTrackerFilter === "active") {
      return c.status === "Active" && (!c.expiryDate || toDate(c.expiryDate) >= todayZero);
    }

    if (selectedTrackerFilter === "expiring") {
      if (!c.expiryDate) return false;
      const d = toDate(c.expiryDate);
      const diff = (d - todayZero) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }

    if (selectedTrackerFilter === "expired") {
      return Boolean(c.expiryDate && toDate(c.expiryDate) < todayZero);
    }

    return true;
  });

  const isManagementRole = role === "admin" || role === "supervisor" || role === "cardiology";

  // Dynamic Header Labels
  const headerTitle = 
    role === "admin" ? "Comprehensive Certifications" :
    role === "supervisor" ? "ICU Staff Certifications" :
    role === "cardiology" ? "Cardiology Certifications" :
    "My Certifications";

  const headerDescription = 
    role === "admin" ? "Explore, create, upload and manage accredited qualifications for hospital staff." :
    role === "supervisor" ? "Monitor, create, and manage certifications for all ICU department staff." :
    role === "cardiology" ? "Specialized cardiac accreditations, certifications, and surgical milestones." :
    "Explore and access your accredited program certificates.";

  // Handle File Selection for "Upload Certificate"
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        courseTitle: prev.courseTitle || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      }));
    }
  };

  // Handle "Upload Certificate" Submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.courseTitle || !uploadFormData.staffName) {
      toast.error("Please enter certificate title and staff recipient", { title: "Required Fields" });
      return;
    }

    // Calculate clean validity in days / months / years
    const getUploadValidity = (expiry) => {
      if (!expiry || isNaN(new Date(expiry).getTime())) return "Verified";
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(expiry);
      target.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return "Expired";
      if (diffDays === 0) return "Expires Today";
      if (diffDays === 1) return "1 Day";
      if (diffDays <= 90) return `${diffDays} Days`;
      const months = Math.round(diffDays / 30);
      if (months < 12) return `${months} Months`;
      const years = (diffDays / 365).toFixed(1).replace(".0", "");
      return `${years} Year${years === "1" ? "" : "s"}`;
    };

    const newCert = createCertification({
      ...uploadFormData,
      validity: getUploadValidity(uploadFormData.expiryDate),
      validitySubtext: uploadFormData.expiryDate ? `Until ${uploadFormData.expiryDate}` : (uploadFormData.issueDate ? `Issued ${uploadFormData.issueDate}` : "Active"),
      footnote: uploadFormData.expiryDate ? `Valid until ${uploadFormData.expiryDate}` : (uploadFormData.fileName ? `File: ${uploadFormData.fileName}` : "Uploaded Document"),
      description: uploadFormData.fileName 
        ? `Officially uploaded medical credential document (${uploadFormData.fileName}, ${uploadFormData.fileSize || "PDF"}) verified for ${uploadFormData.staffName}.`
        : `Verified medical accreditation certificate uploaded for ${uploadFormData.staffName} (${uploadFormData.department} Department).`,
      features: [
        uploadFormData.fileName ? `Document: ${uploadFormData.fileName}` : "Digital Accredited Certificate",
        uploadFormData.issueDate ? `Issue Date: ${uploadFormData.issueDate}` : "Verified Hospital Record",
        uploadFormData.expiryDate ? `Expiry Date: ${uploadFormData.expiryDate}` : "No Expiry Specified",
        ...(uploadFormData.accreditationBody ? [`Accreditation Body: ${uploadFormData.accreditationBody}`] : [])
      ],
      status: "Active",
      isUploaded: true
    });

    toast.success(`Uploaded certificate "${newCert.courseTitle}" registered successfully!`, {
      title: "Certificate Uploaded"
    });

    setIsUploadModalOpen(false);
    loadCerts();
  };


  // Handle Renewal Submit
  const handleRenewSubmit = (e) => {
    e.preventDefault();
    if (!renewCert) return;

    if (renewalForm.validity === "Custom Date" && !renewalForm.customDate) {
      toast.error("Please select a custom expiry date for renewal", { title: "Custom Date Required" });
      return;
    }

    renewCertification(renewCert.id, renewalForm);

    toast.success(`Certificate "${renewCert.courseTitle}" renewed successfully!`, {
      title: "Accreditation Renewed"
    });

    setRenewCert(null);
    setRenewalForm({ validity: "1 Year", customDate: "", notes: "" });
    loadCerts();
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (!deleteCertConfirm) return;
    deleteCertification(deleteCertConfirm.id);
    toast.success(`Certificate "${deleteCertConfirm.courseTitle}" deleted successfully.`, {
      title: "Certificate Deleted"
    });
    setDeleteCertConfirm(null);
    loadCerts();
  };

  // ── Certificate Tracking Stats (management only) ──────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trackingStats = useMemo(() => {
    const toDate = (str) => { const d = new Date(str); d.setHours(0,0,0,0); return d; };
    const total     = scopedCerts.length;
    const expired   = scopedCerts.filter(c => c.expiryDate && toDate(c.expiryDate) < today);
    const soon30    = scopedCerts.filter(c => {
      if (!c.expiryDate) return false;
      const d = toDate(c.expiryDate);
      const diff = (d - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    });
    const active    = scopedCerts.filter(c => c.status === "Active" && (!c.expiryDate || toDate(c.expiryDate) >= today));
    const pending   = scopedCerts.filter(c => !c.approvalStatus || c.approvalStatus === "Pending");
    return { total, expired, soon30, active, pending };
  }, [scopedCerts, today]);

  const [sidebarTab, setSidebarTab] = useState("expiring");

  // Handle Staff Renewal Request Submit
  const handleStaffRenewalRequest = (e) => {
    e.preventDefault();
    if (!requestRenewalCert) return;

    const requestDate = new Date().toISOString().split("T")[0];
    updateCertification(requestRenewalCert.id, {
      approvalStatus: "Pending",
      isRenewalRequest: true,
      renewalRequestedAt: requestDate,
      renewalRequestedBy: activeUser.name,
      renewalRequestNotes: renewalRequestNotes || "Staff requested credential renewal."
    });

    toast.success(`Renewal request submitted for "${requestRenewalCert.courseTitle}". HR & Dept Head have been notified.`, {
      title: "Renewal Request Sent"
    });

    setRequestRenewalCert(null);
    setRenewalRequestNotes("");
    setPreviewCert(null);
    loadCerts();
  };

  const handleApprove = (cert) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (cert.isRenewalRequest) {
      // If it's a renewal request, extend validity by 1 year from current expiry or today
      const baseDate = cert.expiryDate ? new Date(cert.expiryDate) : new Date();
      const newExp = new Date(baseDate);
      newExp.setFullYear(newExp.getFullYear() + 1);
      const newExpiryStr = newExp.toISOString().split("T")[0];

      updateCertification(cert.id, {
        approvalStatus: "Approved",
        isRenewalRequest: false,
        status: "Active",
        expiryDate: newExpiryStr,
        validity: "1 Year",
        validitySubtext: `Renewed ${todayStr}`,
        footnote: `Valid until ${newExpiryStr}`,
        approvedBy: activeUser.name,
        approvedAt: todayStr
      });
      toast.success(`Renewal request approved for "${cert.courseTitle}". Credential extended by 1 Year.`, { title: "Renewal Approved" });
    } else {
      updateCertificationStatus(cert.id, "Approved");
      updateCertification(cert.id, { approvalStatus: "Approved", approvedBy: activeUser.name, approvedAt: todayStr });
      toast.success(`Certificate "${cert.courseTitle}" approved.`, { title: "Approved" });
    }
    loadCerts();
  };

  const handleReject = (cert) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (cert.isRenewalRequest) {
      updateCertification(cert.id, {
        isRenewalRequest: false,
        approvalStatus: "Approved", // keep original cert status intact
        renewalRejectedAt: todayStr,
        renewalRejectedBy: activeUser.name
      });
      toast.error(`Renewal request declined for "${cert.courseTitle}".`, { title: "Renewal Declined" });
    } else {
      updateCertification(cert.id, { approvalStatus: "Rejected", rejectedBy: activeUser.name, rejectedAt: todayStr });
      toast.error(`Certificate "${cert.courseTitle}" rejected.`, { title: "Rejected" });
    }
    loadCerts();
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm gap-6">
      
      {/* ── Top Header Bar (With Create & Upload Provisions) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={headerTitle}
          description={headerDescription}
        />

        {/* Action Buttons: Create Certificate (Admin/Dept Heads only) & Upload Certificate (All roles including Standard User) */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Create Certificate: Only visible for HR Head and Dept Heads */}
          {isManagementRole && (
            <button
              onClick={() => {
                const targetPath = 
                  role === "admin" ? "/hr-head/certification/create" :
                  role === "cardiology" ? "/dept-head-cardiology/certification/create" :
                  "/dept-head/certification/create";
                router.push(targetPath);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Certificate
            </button>
          )}

          {/* Upload Certificate: Available for Standard Users and Management */}
          <button
            onClick={() => {
              if (role === "user") {
                setUploadFormData(prev => ({
                  ...prev,
                  staffName: activeUser.name,
                  staffId: activeUser.id,
                  department: activeUser.department || "Cardiology"
                }));
              }
              setIsUploadModalOpen(true);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 shrink-0 ${
              !isManagementRole
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Upload className={`w-4 h-4 ${!isManagementRole ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
            Upload Certificate
          </button>

          {/* Search Input */}
          <div className="hidden md:block relative w-56">
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Main Grid: Certificates + Tracking Sidebar ── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">

        {/* ── LEFT: Certificate Cards ── */}
        <div className={`${isManagementRole ? "xl:col-span-3" : "xl:col-span-4"} flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 overflow-hidden`}>
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Certificates Registry</span>
              {selectedTrackerFilter !== "all" && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  selectedTrackerFilter === "active"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : selectedTrackerFilter === "expiring"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                }`}>
                  Filtered: {selectedTrackerFilter}
                  <button
                    type="button"
                    onClick={() => setSelectedTrackerFilter("all")}
                    className="ml-1 hover:opacity-75 cursor-pointer font-black text-xs"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">{filteredCerts.length} credential{filteredCerts.length !== 1 ? "s" : ""}</span>
              {selectedTrackerFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedTrackerFilter("all")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 themed-scroll">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredCerts.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  actionLabel={isManagementRole ? "Preview" : "View"}
                  onAction={() => setPreviewCert(cert)}
                  showStaff={isManagementRole}
                  isManagement={isManagementRole}
                  onEdit={(c) => {
                    const basePath = 
                      role === "admin" ? "/hr-head/certification/create" :
                      role === "cardiology" ? "/dept-head-cardiology/certification/create" :
                      "/dept-head/certification/create";
                    router.push(`${basePath}?editId=${c.id}`);
                  }}
                  onRenew={(c) => {
                    setRenewCert(c);
                    setRenewalForm({ validity: "1 Year", customDate: "", notes: "" });
                  }}
                  onDelete={(c) => setDeleteCertConfirm(c)}
                />
              ))}

              {filteredCerts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 font-semibold">
                  {role === "user" ? "No certificates earned yet." : "No certificates found."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Certificate Tracking Sidebar (Management only) ── */}
        {isManagementRole && (
          <div className="xl:col-span-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Certificate Tracker</span>
              </div>

              {/* Stat Cards - Interactive filter buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Total */}
                <button
                  type="button"
                  onClick={() => setSelectedTrackerFilter("all")}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrackerFilter === "all"
                      ? "bg-slate-100 dark:bg-slate-800 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</p>
                    {selectedTrackerFilter === "all" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{trackingStats.total}</p>
                </button>

                {/* Active */}
                <button
                  type="button"
                  onClick={() => setSelectedTrackerFilter(prev => prev === "active" ? "all" : "active")}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrackerFilter === "active"
                      ? "bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                      : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</p>
                    {selectedTrackerFilter === "active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{trackingStats.active.length}</p>
                </button>

                {/* Expiring */}
                <button
                  type="button"
                  onClick={() => setSelectedTrackerFilter(prev => prev === "expiring" ? "all" : "expiring")}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrackerFilter === "expiring"
                      ? "bg-amber-100/70 dark:bg-amber-950/50 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-sm"
                      : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Expiring</p>
                    {selectedTrackerFilter === "expiring" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{trackingStats.soon30.length}</p>
                </button>

                {/* Expired */}
                <button
                  type="button"
                  onClick={() => setSelectedTrackerFilter(prev => prev === "expired" ? "all" : "expired")}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrackerFilter === "expired"
                      ? "bg-rose-100/70 dark:bg-rose-950/50 border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/30 shadow-sm"
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Expired</p>
                    {selectedTrackerFilter === "expired" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{trackingStats.expired.length}</p>
                </button>
              </div>
            </div>

            {/* Tab Bar - Clean themed pill selector matching UniversalTrainingCalendar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 shrink-0">
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
                {[
                  { key: "expiring", label: "Expiring", icon: Clock, count: trackingStats.soon30.length },
                  { key: "expired", label: "Expired", icon: XCircle, count: trackingStats.expired.length },
                  { key: "approval", label: "Approval", icon: ClipboardCheck, count: trackingStats.pending.length },
                ].map(({ key, label, icon: Icon, count }) => {
                  const isActive = sidebarTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSidebarTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{label}</span>
                      {count > 0 && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 themed-scroll space-y-3">

              {/* Expiring Soon Tab */}
              {sidebarTab === "expiring" && (
                trackingStats.soon30.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-20 text-slate-400" />
                    <p className="text-xs font-semibold text-center">No certificates expiring in the next 30 days</p>
                  </div>
                ) : (
                  trackingStats.soon30.map(cert => {
                    const daysLeft = Math.ceil((new Date(cert.expiryDate) - today) / (1000 * 60 * 60 * 24));
                    return (
                      <div
                        key={cert.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-blue-200 dark:hover:border-blue-900/50 space-y-2.5 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{cert.courseTitle}</p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{cert.staffName}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            daysLeft <= 7
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                          }`}>{daysLeft}d left</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>Expires: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cert.expiryDate}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setRenewCert(cert); setRenewalForm({ validity: "1 Year", customDate: "", notes: "" }); }}
                          className="w-full text-xs font-bold py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Renew Now
                        </button>
                      </div>
                    );
                  })
                )
              )}

              {/* Expired Tab */}
              {sidebarTab === "expired" && (
                trackingStats.expired.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-20 text-slate-400" />
                    <p className="text-xs font-semibold text-center">No expired certificates found</p>
                  </div>
                ) : (
                  trackingStats.expired.map(cert => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-rose-200 dark:hover:border-rose-900/50 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{cert.courseTitle}</p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{cert.staffName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shrink-0">
                          Expired
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>Expired on: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cert.expiryDate}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setRenewCert(cert); setRenewalForm({ validity: "1 Year", customDate: "", notes: "" }); }}
                        className="w-full text-xs font-bold py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Renew Credential
                      </button>
                    </div>
                  ))
                )
              )}

              {/* Approval Tab */}
              {sidebarTab === "approval" && (
                trackingStats.pending.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <ClipboardCheck className="w-10 h-10 mb-2 opacity-20 text-slate-400" />
                    <p className="text-xs font-semibold text-center">All certificates approved</p>
                  </div>
                ) : (
                  trackingStats.pending.map(cert => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-blue-200 dark:hover:border-blue-900/40 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{cert.courseTitle}</p>
                          {cert.isRenewalRequest ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                              Renewal Request
                            </span>
                          ) : cert.isCourseCompletionRequest ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 shrink-0">
                              Course Completion
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shrink-0">
                              New Credential
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {cert.staffName} {cert.designation ? `(${cert.designation})` : ""} {cert.department ? `· ${cert.department}` : ""}
                        </p>
                      </div>

                      {cert.isRenewalRequest ? (
                        <div className="space-y-1 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-100 dark:border-amber-900/30 text-[10px]">
                          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Requested on: <strong>{cert.renewalRequestedAt || "Today"}</strong></span>
                          </div>
                          {cert.renewalRequestNotes && (
                            <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2">
                              "{cert.renewalRequestNotes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Bell className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                          <span>Issued: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cert.issueDate || "Recent"}</strong></span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(cert)}
                          className="flex-1 text-xs font-bold py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> {cert.isRenewalRequest ? "Approve Renewal" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(cert)}
                          className="flex-1 text-xs font-bold py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          </div>
        )}

      </div>

      {/* ── 2. Upload Certificate Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto themed-scroll">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload Certificate</h3>
                  <p className="text-xs font-semibold text-slate-400">Import an existing PDF or digital medical certificate</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 dark:border-blue-800/60 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-blue-50/30 dark:bg-blue-950/20 flex flex-col items-center justify-center gap-2"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Upload className="w-6 h-6" />
                </div>
                {uploadFormData.fileName ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{uploadFormData.fileName}</p>
                    <p className="text-xs text-slate-400">{uploadFormData.fileSize} · Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Click to browse or drop certificate file
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Supports PDF, PNG, JPG (Max 15MB)</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Certificate / Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Surgical Certification"
                    value={uploadFormData.courseTitle}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, courseTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={role === "user"}
                    placeholder="e.g. Dr. Anil Verma"
                    value={uploadFormData.staffName}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, staffName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 ${role === "user" ? "bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed opacity-90" : "bg-slate-50 dark:bg-slate-800"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    readOnly={role === "user"}
                    placeholder="e.g. Orthopaedics"
                    value={uploadFormData.department}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, department: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 ${role === "user" ? "bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed opacity-90" : "bg-slate-50 dark:bg-slate-800"}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Accreditation Body
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MCI, NMC, Hospital Board"
                    value={uploadFormData.accreditationBody || ""}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, accreditationBody: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── Issue Date & Expiry Date ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadFormData.issueDate}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={uploadFormData.expiryDate}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
                >
                  <Upload className="w-4 h-4" /> Upload Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Certificate Preview Modal ── */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-black text-slate-900 dark:text-white">Certificate Verification</h3>
              </div>
              <button 
                onClick={() => setPreviewCert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Sheet Display */}
            <div className="border-4 border-double border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 rounded-[2rem] p-8 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                <Award className="w-8 h-8" />
              </div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-1">
                Hospital Training & Accreditation Board
              </p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Certificate of Competence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This is to certify that
              </p>

              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight mb-1">
                {previewCert.staffName}
              </p>
              <p className="text-xs font-semibold text-slate-500 mb-6">
                {previewCert.department} Department {previewCert.designation ? `· ${previewCert.designation}` : ""}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                has successfully completed all required modules, assessments, and clinical benchmarks for the program:
              </p>
              <p className="text-lg font-black text-slate-800 dark:text-white mb-6">
                "{previewCert.courseTitle}" ({previewCert.courseCode})
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Cert ID: {previewCert.certificateNo}</p>
                  <p>Issued: {previewCert.issueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Authorized Signatory</p>
                  <p>Hospital Administration</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {isManagementRole ? (
                  <>
                    <button
                      onClick={() => {
                        const targetId = previewCert.id;
                        setPreviewCert(null);
                        const basePath = 
                          role === "admin" ? "/hr-head/certification/create" :
                          role === "cardiology" ? "/dept-head-cardiology/certification/create" :
                          "/dept-head/certification/create";
                        router.push(`${basePath}?editId=${targetId}`);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        const target = { ...previewCert };
                        setPreviewCert(null);
                        setRenewCert(target);
                        setRenewalForm({ validity: "1 Year", customDate: "", notes: "" });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold text-xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </button>
                  </>
                ) : (
                  previewCert.isRenewalRequest ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" /> Renewal Requested
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const target = { ...previewCert };
                        setRequestRenewalCert(target);
                        setRenewalRequestNotes("");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Request Renewal
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success("Printing certificate...", { title: "Certificate Print" });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 font-bold text-xs"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => {
                    toast.success("Downloading Certificate PDF...", { title: "Export Ready" });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}



      {/* ── 5. Renew Certificate Modal ── */}
      {renewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Renew Accreditation</h3>
                  <p className="text-xs font-semibold text-slate-400">Extend credential validity for recipient clinician</p>
                </div>
              </div>
              <button 
                onClick={() => setRenewCert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Certificate Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Certificate</p>
              <p className="text-base font-black text-slate-900 dark:text-white">{renewCert.courseTitle}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span>Clinician: <strong>{renewCert.staffName}</strong></span>
                <span>Current Expiry: <strong className="text-amber-600 dark:text-amber-400">{renewCert.expiryDate || "Not Specified"}</strong></span>
              </div>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Renewal Validity Tenure *
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm">
                    <span className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {renewalForm.validity}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent 
                    align="start" 
                    className="w-[220px] rounded-2xl p-1.5 shadow-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 backdrop-blur-md z-50"
                  >
                    {[
                      { label: "3 Months", desc: "Short renewal extension" },
                      { label: "6 Months", desc: "Mid-term recertification" },
                      { label: "1 Year", desc: "Standard annual hospital tenure" },
                      { label: "3 Years", desc: "Long-term senior qualification" },
                      { label: "Custom Date", desc: "Specify exact calendar date" },
                    ].map((opt) => {
                      const isSelected = renewalForm.validity === opt.label;
                      return (
                        <DropdownMenuItem
                          key={opt.label}
                          onClick={() => setRenewalForm({ ...renewalForm, validity: opt.label })}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-medium transition-colors ${
                            isSelected 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold" 
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{opt.label}</span>
                            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">{opt.desc}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {renewalForm.validity === "Custom Date" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 animate-in fade-in-50 duration-200">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    New Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={renewalForm.customDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, customDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Renewal Notes / Accreditation Council Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. CME hours verified and approved by Department Quality Board."
                  value={renewalForm.notes}
                  onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRenewCert(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Delete Confirmation Modal ── */}
      {deleteCertConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5 text-center">
            
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Certificate?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete the accredited certificate for <strong className="text-slate-800 dark:text-slate-200">"{deleteCertConfirm.courseTitle}"</strong> ({deleteCertConfirm.staffName})?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCertConfirm(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-500/20"
              >
                Delete Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Staff Request Renewal Modal ── */}
      {requestRenewalCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Request Certificate Renewal</h3>
                  <p className="text-xs font-semibold text-slate-400">Notify HR & Department Head for re-accreditation</p>
                </div>
              </div>
              <button 
                onClick={() => setRequestRenewalCert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStaffRenewalRequest} className="space-y-4">
              {/* Certificate Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {requestRenewalCert.courseTitle}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>ID: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{requestRenewalCert.certificateNo || "N/A"}</strong></span>
                  <span>•</span>
                  <span>Expires: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{requestRenewalCert.expiryDate || "Not Specified"}</strong></span>
                </div>
              </div>

              {/* Staff Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Renewal Justification / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Completed mandatory CME hours / Seeking annual re-accreditation for clinical duties..."
                  value={renewalRequestNotes}
                  onChange={(e) => setRenewalRequestNotes(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRequestRenewalCert(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
                >
                  <Send className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
