"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Users, Pencil, Trash2, RefreshCw, Save, Mail, UserCircle, ChevronDown, Search, Phone, UserPlus, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ManagePatientsPage() {
  const [patients, setPatients] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hospital_patients");
    if (saved) {
      try { setPatients(JSON.parse(saved)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("hospital_patients", JSON.stringify(patients));
  }, [patients, isLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ id: null, name: "", email: "", phone: "", bloodGroup: "", address: "" });
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.bloodGroup) {
      alert("Please fill all required fields");
      return;
    }
    if (isEditing) {
      setPatients((prev) => prev.map((p) => (p.id === formData.id ? { ...formData } : p)));
      setIsEditing(false);
    } else {
      setPatients((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    handleReset();
  };

  const handleEdit = (patient) => {
    setFormData(patient);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this patient?")) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto space-y-6  dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <PageHeader
        title="Manage Patients"
        description="Register, update and manage patient records."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── FORM ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-rose-500" />
                {isEditing ? "Edit Patient" : "Register New Patient"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Fill patient details to add to hospital records.</p>
            </div>

            <div className="p-6 md:p-8 flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Patient Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email (Optional)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@email.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Blood Group</label>
                  <DropdownMenu>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                        <span className="text-sm font-bold">🩸</span>
                      </div>
                      <DropdownMenuTrigger className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium shadow-sm flex items-center justify-between text-left outline-none cursor-pointer">
                        <span className={formData.bloodGroup === "" ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-white"}>
                          {formData.bloodGroup || "Select blood group..."}
                        </span>
                      </DropdownMenuTrigger>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors z-10">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <DropdownMenuContent className="min-w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                      {BLOOD_GROUPS.map((bg) => (
                        <DropdownMenuItem key={bg} onClick={() => setFormData((p) => ({ ...p, bloodGroup: bg }))}
                          className="px-4 py-3 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                          {bg}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</label>
                  <div className="relative group">
                    <div className="absolute top-0 left-0 pl-4 pt-4 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Patient address..." rows={2}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm resize-none" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-6 flex items-center gap-3">
                  <button type="button" onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <Save className="w-4 h-4" /> {isEditing ? "Update" : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ─── LIST ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-rose-500" />
                  Patient Directory
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">View and manage all registered patients.</p>
              </div>
              <div className="relative w-full sm:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors z-10">
                  <Search className="w-4 h-4" />
                </div>
                <input type="text" placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Blood Group</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                        {searchQuery ? "No patients found matching your search." : "No patients registered yet. Add one using the form."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 flex items-center justify-center font-bold text-sm">
                              {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-rose-600 transition-colors">{patient.name}</p>
                              <p className="text-xs text-slate-500">{patient.email || patient.address || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[11px] font-bold border border-red-200 dark:border-red-800">
                            {patient.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{patient.phone || "—"}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleEdit(patient)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(patient.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
