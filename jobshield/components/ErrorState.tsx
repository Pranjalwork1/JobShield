"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <div className="rounded-[36px] bg-white/95 p-8 sm:p-12 border border-white/90 shadow-2xl shadow-slate-200/50 space-y-6 text-center animate-in fade-in">
      <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">
          Analysis Could Not Be Completed
        </h3>
        <p className="text-xs text-red-700 bg-red-50/60 border border-red-100 p-4 rounded-2xl text-left font-mono leading-relaxed">
          {error}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Your evidence has <strong>not</strong> been classified as safe or unsafe. Please verify your inputs or API settings and try again.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white font-semibold text-xs transition-all shadow-md shadow-[#1E90FF]/25 border-none active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Analysis Again</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Modify Evidence</span>
        </button>
      </div>
    </div>
  );
}
