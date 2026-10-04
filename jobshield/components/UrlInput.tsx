"use client";

import React from "react";
import { Globe, Info } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function UrlInput({ value, onChange, disabled = false }: UrlInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="job-url-input"
        className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider"
      >
        <Globe className="w-4 h-4 text-[#1E90FF]" />
        <span>Job Listing / Company Website URL (Optional)</span>
      </label>

      <div className="relative">
        <input
          id="job-url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://example.com/careers/job-opening-123"
          className="w-full px-4 py-2.5 bg-white/95 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/25 focus:border-[#1E90FF] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        />
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Note: In Prototype 1+2, URLs are analyzed as user-provided evidence context. External Google Search grounding occurs in later phases.
        </span>
      </div>
    </div>
  );
}
