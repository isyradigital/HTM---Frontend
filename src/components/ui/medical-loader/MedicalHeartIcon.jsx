import React from "react";
import { HeartPulse } from "lucide-react";

export function MedicalHeartIcon({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const iconSizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulsating sonar rings */}
      <span className="absolute inline-flex h-full w-full rounded-2xl bg-blue-400 dark:bg-blue-600 opacity-20 animate-ping duration-1000" />
      <span className="absolute inline-flex h-[115%] w-[115%] rounded-3xl bg-blue-500/10 dark:bg-blue-400/10 animate-pulse" />
      
      {/* Center Medical Card with subtle shadow */}
      <div className={`relative ${sizeMap[size] || sizeMap.md} rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 animate-heartbeat`}>
        <HeartPulse className={`${iconSizeMap[size] || iconSizeMap.md} drop-shadow-sm`} />
      </div>
    </div>
  );
}
