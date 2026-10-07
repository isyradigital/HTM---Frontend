"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { 
  BookOpen, 
  Plus, 
  X, 
  Save,
  Building2,
  BadgeCheck,
  Stethoscope,
  ChevronDown,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import trainingData from "./training-data.json";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState(trainingData);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [desigFilter, setDesigFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const departments = ["All", ...new Set(trainingData.map(d => d.department))];
  const designations = ["All", ...new Set(trainingData.map(d => d.designation))];

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.department.toLowerCase().includes(search.toLowerCase()) ||
                          t.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" || t.department === deptFilter;
    const matchesDesig = desigFilter === "All" || t.designation === desigFilter;
    return matchesSearch && matchesDept && matchesDesig;
  });

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ name: "", department: "", designation: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.department || !formData.designation) {
      alert("Please fill all fields");
      return;
    }
    
    setTrainings(prev => [
      ...prev, 
      { id: Date.now(), ...formData }
    ]);
    
    handleReset();
    setIsFormOpen(false);
  };

  const columns = [
    {
      header: (
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Training Name
        </span>
      ),
      cell: (row) => (
        <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
          {row.name}
        </span>
      )
    },
    {
      header: (
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Target Department
        </span>
      ),
      cell: (row) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {row.department}
        </span>
      )
    },
    {
      header: (
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5" /> Target Designation
        </span>
      ),
      cell: (row) => (
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
          {row.designation}
        </span>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto space-y-6 dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm themed-scroll">
      
      {/* Page Header */}
      <PageHeader 
        title="Training Programs" 
        description="Manage and create training sessions for hospital staff."
        actionText={isFormOpen ? "Close Form" : "Add New Training"}
        ActionIcon={isFormOpen ? X : Plus}
        onActionClick={() => setIsFormOpen(!isFormOpen)}
      />

      {/* Collapsible Add Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-blue-200 dark:border-blue-800/50 shadow-lg shadow-blue-500/10 p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Create New Training
            </h3>
            <p className="text-sm text-slate-500 mt-1">Specify training details and target audience.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Training Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Advanced Life Support"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Department</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium shadow-sm flex items-center justify-between text-left outline-none cursor-pointer">
                  <span className={formData.department ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {formData.department || "Select department..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  {["All Departments", "Cardiology", "Neurology", "Emergency Medicine", "ICU", "Radiology", "Pediatrics"].map(dept => (
                    <DropdownMenuItem 
                      key={dept}
                      onClick={() => handleSelectChange("department", dept)}
                      className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {dept}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Designation</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium shadow-sm flex items-center justify-between text-left outline-none cursor-pointer">
                  <span className={formData.designation ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {formData.designation || "Select designation..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  {["All Designations", "Senior Consultant", "Medical Officer", "Senior Resident (SR)", "Junior Resident (JR)", "Senior Nurse", "Staff Nurse"].map(desig => (
                    <DropdownMenuItem 
                      key={desig}
                      onClick={() => handleSelectChange("designation", desig)}
                      className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {desig}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4" />
                Save Training
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainings List */}
      <div className="flex-1 min-h-0">
        <DataTable 
          title="Training List"
          icon={BookOpen}
          data={filteredTrainings}
          columns={columns}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search trainings..."
          emptyMessage="No trainings found."
          filters={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[80px]">
                    {deptFilter === "All" ? "Dept" : deptFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Department</div>
                  {departments.map(dept => (
                    <DropdownMenuItem
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={`px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${deptFilter === dept ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      {dept}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  <span className="truncate max-w-[80px]">
                    {desigFilter === "All" ? "Role" : desigFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-xl border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/95 backdrop-blur-sm z-50">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Designation</div>
                  {designations.map(desig => (
                    <DropdownMenuItem
                      key={desig}
                      onClick={() => setDesigFilter(desig)}
                      className={`px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-colors ${desigFilter === desig ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      {desig}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      </div>

    </div>
  );
}