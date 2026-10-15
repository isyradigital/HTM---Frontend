import React from "react";

export function EcgLineSvg({ className = "w-48 h-12 text-blue-600 dark:text-blue-400" }) {
  return (
    <svg 
      viewBox="0 0 300 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Background subtle guideline */}
      <path 
        d="M 10 40 L 60 40 L 75 40 L 85 28 L 95 52 L 105 40 L 120 40 L 132 8 L 144 72 L 156 22 L 168 46 L 178 40 L 195 40 L 205 32 L 215 48 L 225 40 L 290 40" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeOpacity="0.15" 
      />
      {/* Animated Glowing ECG line */}
      <path 
        d="M 10 40 L 60 40 L 75 40 L 85 28 L 95 52 L 105 40 L 120 40 L 132 8 L 144 72 L 156 22 L 168 46 L 178 40 L 195 40 L 205 32 L 215 48 L 225 40 L 290 40" 
        stroke="url(#ecgGradient)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#ecgGlow)"
        className="animate-ecg"
      />
    </svg>
  );
}
