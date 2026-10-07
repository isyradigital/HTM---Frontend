import React from "react";

export function PageHeader({ title, description, actionText, ActionIcon, onActionClick }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
            {description}
          </p>
        )}
      </div>

      {actionText && (
        <button
          onClick={onActionClick}
          className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionText}
        </button>
      )}
    </div>
  );
}
