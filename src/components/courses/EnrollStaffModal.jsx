"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  CheckCircle2, 
  Building2, 
  ShieldCheck 
} from "lucide-react";
import { DEFAULT_STAFF_MEMBERS } from "@/lib/enrollmentService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EnrollStaffModal({ 
  isOpen, 
  onClose, 
  onEnroll, 
  course, 
  existingStaffIds = [] 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);

  if (!isOpen) return null;

  const availableStaff = DEFAULT_STAFF_MEMBERS.filter(
    (staff) => !existingStaffIds.includes(staff.id)
  ).filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    onEnroll(selectedStaff);
    setSelectedStaff(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enroll Staff Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Course: <span className="font-semibold text-blue-600 dark:text-blue-400">{course?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, department, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-xs font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Staff Selection List */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1 themed-scroll">
          {availableStaff.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No eligible staff members found to enroll.
            </div>
          ) : (
            availableStaff.map((staff) => {
              const isSelected = selectedStaff?.id === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-900/30 border-blue-500 shadow-xs"
                      : "bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white dark:border-slate-700 shadow-xs">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.avatarSeed}`} />
                      <AvatarFallback>{staff.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {staff.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono">
                          {staff.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {staff.department}
                        </span>
                        <span>•</span>
                        <span>{staff.designation}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedStaff}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              selectedStaff
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 cursor-pointer"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            Confirm Enrollment
          </button>
        </div>
      </div>
    </div>
  );
}
