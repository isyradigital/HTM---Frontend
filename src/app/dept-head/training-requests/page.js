"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Search, Filter, Calendar, Clock, MapPin, UserCircle, CheckCircle, XCircle, Info, User, ChevronRight } from "lucide-react";

/* ─── Medical Color palette for events ─────────────────────────────────────── */
const EVENT_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500", border: "border-blue-200 dark:border-blue-800" }, // General Medical
  { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500", border: "border-teal-200 dark:border-teal-800" }, // Surgery / ER
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800" }, // Pharmacy / Wellness
  { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500", border: "border-rose-200 dark:border-rose-800" }, // Emergency / Blood
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500", border: "border-indigo-200 dark:border-indigo-800" }, // Lab / Tests
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500", border: "border-cyan-200 dark:border-cyan-800" }, // Radiology / Therapy
];

const getColor = (evt) => {
  let idx = evt?.colorIndex;
  if (idx === undefined || idx >= EVENT_COLORS.length || isNaN(idx)) {
    idx = parseInt(evt?.id, 10);
    if (isNaN(idx)) idx = 0;
  }
  return EVENT_COLORS[idx % EVENT_COLORS.length] || EVENT_COLORS[0];
};

export default function TrainingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const data = localStorage.getItem("hospital_trainings");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setRequests(parsed);
      } catch {}
    }
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updated);
    localStorage.setItem("hospital_trainings", JSON.stringify(updated));
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const filtered = requests.filter(r => {
    if (filter !== "All" && r.status !== filter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-6 bg-transparent p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Training Requests" 
          description="Review and approve training requests from staff."
        />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search trainings..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
            />
          </div>
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
            {["All", "Pending", "Approved", "Rejected"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === f ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Col: Request List */}
        <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-black/20 overflow-hidden">
          <div className="flex-1 overflow-y-auto themed-scroll p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
               <Info className="w-12 h-12 opacity-20 mb-3" />
               <p className="font-semibold text-lg">No requests found</p>
            </div>
          ) : (
            filtered.map((req) => {
              const c = getColor(req);
              const isSelected = selectedRequest?.id === req.id;
              
              return (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex justify-between items-center gap-4 ${
                    isSelected 
                      ? `border-purple-200 dark:border-purple-800 bg-purple-100 dark:bg-purple-900/30 shadow-md ring-1 ring-purple-500/50` 
                      : `border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10`
                  }`}
                >
                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}>{req.title}</p>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                        req.status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        req.status === "Rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {req.status === "Approved" && <CheckCircle className="w-3 h-3" />}
                        {req.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {req.status === "Pending" && <Clock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.fromDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.fromTime} - {req.toTime}</span>
                    </div>
                    {req.location && (
                      <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400"><MapPin className="w-3 h-3" /> {req.location}</p>
                    )}
                    <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                      <UserCircle className="w-3 h-3" /> {req.assignMode === "Group" ? `${req.assignedGroup?.length || 0} Staff` : (req.assignedUser || "Unassigned")}
                    </p>
                  </div>
                  
                  <div className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-white/50 dark:bg-black/20 text-purple-600' : 'text-slate-300 group-hover:text-purple-500'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Right Col: Request Details */}
        <div className="lg:col-span-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-black/20 overflow-hidden">
          {selectedRequest ? (
            <div className={`flex-1 flex flex-col p-6 overflow-y-auto themed-scroll border-t-4 border-purple-200 dark:border-purple-800`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`}>
                   <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight text-purple-700 dark:text-purple-300`}>{selectedRequest.title}</h2>
                  <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      selectedRequest.status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" :
                      selectedRequest.status === "Rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                    }`}>
                      {selectedRequest.status === "Approved" && <CheckCircle className="w-3.5 h-3.5" />}
                      {selectedRequest.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                      {selectedRequest.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                      {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {/* Date & Time */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule</p>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{selectedRequest.fromDate} {selectedRequest.toDate !== selectedRequest.fromDate && ` - ${selectedRequest.toDate}`}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{selectedRequest.fromTime} to {selectedRequest.toTime}</span>
                  </div>
                </div>

                {/* Location */}
                {selectedRequest.location && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{selectedRequest.location}</span>
                    </div>
                  </div>
                )}

                {/* Assigned Users */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned To</p>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    <span>{selectedRequest.assignMode === "Group" 
                      ? `${selectedRequest.assignedGroup?.length || 0} Staff Members (Group)` 
                      : (selectedRequest.assignedUser || "Unassigned")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === "Pending" && (
                <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button 
                    onClick={() => updateStatus(selectedRequest.id, "Rejected")}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-200 dark:border-rose-800/50 shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedRequest.id, "Approved")}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 shadow-inner">
                <Calendar className="w-8 h-8 opacity-50 text-slate-400" />
              </div>
              <p className="font-extrabold text-slate-600 dark:text-slate-300 mb-1">Select a request</p>
              <p className="text-xs font-semibold max-w-[200px]">Click on any training request from the list to view its details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
