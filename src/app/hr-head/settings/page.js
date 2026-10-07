"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Settings, Sun, Moon, Bell, Shield, Globe, Save, Check } from "lucide-react";

export default function SystemSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    hospitalName: "City General Hospital",
    adminEmail: "admin@citygeneral.com",
    language: "English",
    notifications: true,
    twoFactor: false,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("hospital_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto space-y-6  dark:bg-slate-900 p-4 md:p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <PageHeader
        title="System Settings"
        description="Configure hospital system preferences and security settings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── General Settings ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-blue-500/5 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              General
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">Basic hospital information and locale.</p>
          </div>

          <div className="p-6 md:p-8 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hospital Name</label>
              <input type="text" value={settings.hospitalName} onChange={(e) => handleChange("hospitalName", e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">HR Head Email</label>
              <input type="email" value={settings.adminEmail} onChange={(e) => handleChange("adminEmail", e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Language</label>
              <select value={settings.language} onChange={(e) => handleChange("language", e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-white shadow-sm appearance-none cursor-pointer">
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Security & Notifications ──────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-lg shadow-amber-500/5 dark:shadow-none hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Security & Notifications
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">Manage security and alert preferences.</p>
          </div>

          <div className="p-6 md:p-8 space-y-6 flex-1">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts for critical events.</p>
                </div>
              </div>
              <button
                onClick={() => handleChange("notifications", !settings.notifications)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${settings.notifications ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.notifications ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Extra login security layer.</p>
                </div>
              </div>
              <button
                onClick={() => handleChange("twoFactor", !settings.twoFactor)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${settings.twoFactor ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.twoFactor ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* Placeholder for future settings */}
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-sm text-slate-400">
              More security options coming soon...
            </div>
          </div>
        </div>
      </div>

      {/* ─── Save Button ──────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
