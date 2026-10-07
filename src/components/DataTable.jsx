import React from "react";
import { Search, Inbox } from "lucide-react";

export function DataTable({ 
  columns, 
  data, 
  searchQuery = "", 
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  title,
  icon: Icon,
  filters
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full min-h-[400px]">
      
      {/* Header & Search */}
      <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {title && (
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-blue-500" />}
              {title}
              <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                {data.length} Total
              </span>
            </h3>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {filters && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {filters}
            </div>
          )}
          
          {onSearchChange && (
            <div className="relative w-full sm:w-64 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto themed-scroll">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center text-slate-400">
                    <Inbox className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-semibold">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 ${col.cellClassName || ""}`}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
