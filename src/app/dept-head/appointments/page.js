"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Calendar, Clock, Search, Trash2, Save, RefreshCw, UserCircle, Stethoscope, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    patientName: "",
    doctorName: "",
    date: "",
    time: "",
    status: "Scheduled",
  });

  useEffect(() => {
    const saved = localStorage.getItem("hospital_appointments");
    if (saved) { try { setAppointments(JSON.parse(saved)); } catch {} }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("hospital_appointments", JSON.stringify(appointments));
  }, [appointments, isLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ id: null, patientName: "", doctorName: "", date: "", time: "", status: "Scheduled" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.doctorName || !formData.date || !formData.time) {
      alert("Please fill all required fields");
      return;
    }
    setAppointments((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    handleReset();
  };

  const handleDelete = (id) => {
    if (confirm("Cancel this appointment?")) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setAppointments((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: a.status === "Scheduled" ? "Completed" : "Scheduled" } : a
    ));
  };

  const filtered = appointments.filter((a) =>
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full w-full h-full overflow-y-auto space-y-6">
      <PageHeader title="Appointments" description="Schedule and manage patient appointments." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── FORM ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                New Appointment
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Book a new patient appointment.</p>
            </div>

            <div className="p-6 md:p-8 flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Patient Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10"><UserCircle className="w-5 h-5" /></div>
                    <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Patient full name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Doctor</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10"><Stethoscope className="w-5 h-5" /></div>
                    <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange} placeholder="Dr. Name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10"><Calendar className="w-5 h-5" /></div>
                    <input type="date" name="date" value={formData.date} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time Slot</label>
                  <DropdownMenu>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10"><Clock className="w-5 h-5" /></div>
                      <DropdownMenuTrigger className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium shadow-sm flex items-center text-left outline-none cursor-pointer">
                        <span className={formData.time === "" ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-white"}>
                          {formData.time || "Select time..."}
                        </span>
                      </DropdownMenuTrigger>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 z-10"><ChevronDown className="w-4 h-4" /></div>
                    </div>
                    <DropdownMenuContent className="min-w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                      {TIME_SLOTS.map((t) => (
                        <DropdownMenuItem key={t} onClick={() => setFormData((p) => ({ ...p, time: t }))}
                          className="px-4 py-3 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                          {t}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="pt-6 flex items-center gap-3">
                  <button type="button" onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <Save className="w-4 h-4" /> Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ─── LIST ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" /> Appointment Schedule
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">All booked appointments.</p>
              </div>
              <div className="relative w-full sm:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10"><Search className="w-4 h-4" /></div>
                <input type="text" placeholder="Search appointments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Date & Time</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">{searchQuery ? "No results." : "No appointments yet."}</td></tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-sm">{a.patientName.charAt(0).toUpperCase()}</div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{a.patientName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{a.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">{a.date}</span> · {a.time}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleStatus(a.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${a.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"}`}>
                            {a.status === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {a.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(a.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-all" title="Cancel"><Trash2 className="w-4 h-4" /></button>
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
