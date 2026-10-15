"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CertificateCard } from "@/components/courses/CertificateCard";
import { 
  getCertifications, 
  createCertification, 
  updateCertificationStatus 
} from "@/lib/certificationService";
import { useToast } from "@/components/ToastProvider";
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  X, 
  Calendar,
  Users,
  Eye,
  Sparkles,
  Printer
} from "lucide-react";

export default function HRCertificationPage() {
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  // Form State for Creating Certificate
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    staffName: "",
    staffId: "",
    department: "Cardiology",
    designation: "Medical Staff",
    category: "Clinical Care",
    badgeLabel: "Level 1",
    validity: "2 Years",
    score: 90,
    features: [
      "Hospital Standard Safety Guidelines",
      "Core Competency Assessment Passed",
      "Clinical Protocol Compliance"
    ]
  });

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

  // Filtered Certificates
  const filteredCerts = certificates.filter(c => {
    const matchesSearch = 
      c.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Summary Metrics
  const totalCerts = certificates.length;
  const activeCerts = certificates.filter(c => c.status === "Active").length;
  const pendingCerts = certificates.filter(c => c.status === "Pending Approval").length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.courseTitle || !formData.staffName) {
      toast.error("Please fill in course title and staff name", { title: "Required Fields" });
      return;
    }

    const newCert = createCertification({
      ...formData,
      status: "Active"
    });

    toast.success(`Certificate ${newCert.certificateNo} created successfully!`, {
      title: "Certificate Issued"
    });

    setIsCreateModalOpen(false);
    loadCerts();
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full space-y-6 bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-y-auto themed-scroll">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <PageHeader 
          title="Hospital Certifications" 
          description="Issue, monitor, and manage clinical staff certificates across all training programs."
        />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Issue Certificate
        </button>
      </div>

      {/* ── Stat Tracker Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Issued</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{totalCerts}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Valid</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{activeCerts}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{pendingCerts}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course, staff member, certificate ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Disciplines</option>
            <option value="Clinical Care">Clinical Care</option>
            <option value="Surgery">Surgery</option>
            <option value="Nursing">Nursing</option>
            <option value="Emergency">Emergency</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* ── Cards Grid (Using Reference Design) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCerts.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-base">No certificates found</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">Try clearing your search query or filters, or issue a new certification.</p>
          </div>
        ) : (
          filteredCerts.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              actionLabel="Preview"
              onAction={() => setPreviewCert(cert)}
              showStaff={true}
            />
          ))
        )}
      </div>

      {/* ── Issue Certificate Modal ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto themed-scroll">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Issue Hospital Certificate</h3>
                  <p className="text-xs font-semibold text-slate-400">Accredit a staff member with a completed qualification</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Course / Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU Life Support Program"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICU-301"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Discipline
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Clinical Care">Clinical Care</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% / Level 2"
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Validity
                  </label>
                  <select
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
                >
                  Issue Now
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
                {previewCert.department} Department
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

            <div className="flex items-center justify-end gap-3">
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
      )}

    </div>
  );
}