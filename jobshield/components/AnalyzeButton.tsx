"use client";

import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  evidenceCount: number;
}

export function AnalyzeButton({
  onClick,
  isLoading,
  disabled,
  evidenceCount,
}: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      id="analyze-case-button"
      className={`w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
        disabled || isLoading
          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200/80"
          : "bg-slate-950 hover:bg-slate-900 text-white shadow-xl shadow-slate-900/15 hover:scale-[1.01] active:scale-[0.99] border border-slate-900 cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
          <span>JobShield is analyzing case evidence...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-5 h-5" />
          <span>
            ANALYZE CASE{" "}
            {evidenceCount > 0 && (
              <span className="opacity-90 font-normal text-sm">
                ({evidenceCount} evidence item{evidenceCount > 1 ? "s" : ""})
              </span>
            )}
          </span>
        </>
      )}
    </button>
  );
}
