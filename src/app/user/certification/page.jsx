"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CertificateCard } from "@/components/courses/CertificateCard";
import { getCertifications } from "@/lib/certificationService";
import { useToast } from "@/components/ToastProvider";
import { 
  Award, 
  Search, 
  ShieldCheck, 
  Download, 
  Clock, 
  X, 
  Printer, 
  Sparkles,
  BookOpen
} from "lucide-react";

export default function UserCertificationPage() {
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: "WF001",
    name: "Dr. Rajesh Sharma",
    department: "Cardiology",
    designation: "Senior Consultant"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("current_standard_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCurrentUser(parsed);
      }
    } catch (e) {}

    const load = () => {
      setCertificates(getCertifications());
    };
    load();

    window.addEventListener("hospital_certifications_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("hospital_certifications_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Filter certifications belonging to this logged in user (or matching staffName/staffId)
  const myCertificates = certificates.filter(c => {
    const isMine = 
      (c.staffId && c.staffId === currentUser.id) ||
      (c.staffName && c.staffName.toLowerCase() === currentUser.name.toLowerCase());
    return isMine;
  });

  const filteredCerts = myCertificates.filter(c => {
    return (
      c.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col w-full h-full space-y-6 bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-y-auto themed-scroll">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <PageHeader 
          title="My Certifications" 
          description={`Accredited certificates awarded to ${currentUser.name}.`}
        />
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800/60">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
            {myCertificates.length} Certified Program{myCertificates.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your certificates by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ── Cards Grid (Reference Design) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCerts.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 p-8">
            <Award className="w-12 h-12 text-blue-500/40 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-base">No Certificates Yet</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Complete your enrolled training courses to 100% to unlock and apply for certificates.
            </p>
          </div>
        ) : (
          filteredCerts.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              actionLabel="View Certificate"
              onAction={() => setPreviewCert(cert)}
              showStaff={false}
            />
          ))
        )}
      </div>

      {/* ── Certificate Preview Modal ── */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-black text-slate-900 dark:text-white">Official Certificate</h3>
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
                Certificate of Completion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This is awarded to
              </p>

              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight mb-1">
                {previewCert.staffName}
              </p>
              <p className="text-xs font-semibold text-slate-500 mb-6">
                {previewCert.department} Department · {previewCert.designation}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                for demonstrating clinical excellence and successfully completing all modules of:
              </p>
              <p className="text-lg font-black text-slate-800 dark:text-white mb-6">
                "{previewCert.courseTitle}" ({previewCert.courseCode})
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Cert ID: {previewCert.certificateNo}</p>
                  <p>Issue Date: {previewCert.issueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Validity: {previewCert.validity}</p>
                  <p>Accredited by HR</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => toast.success("Printing certificate...", { title: "Print Sent" })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 font-bold text-xs"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => toast.success("Certificate downloaded successfully!", { title: "PDF Ready" })}
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