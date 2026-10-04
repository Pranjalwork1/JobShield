"use client";

import React from "react";
import {
  Plus,
  Search,
  Compass,
  LayoutGrid,
  History,
} from "lucide-react";
import { JobShieldIcon } from "@/components/brand/JobShieldLogo";

interface FloatingDockProps {
  onNewCase: () => void;
  onAnalyze: () => void;
  evidenceCount: number;
  isAnalyzing?: boolean;
  onStopAnalysis?: () => void;
}

export function FloatingDock({
  onNewCase,
  onAnalyze,
  evidenceCount,
  isAnalyzing = false,
  onStopAnalysis,
}: FloatingDockProps) {
  return (
    <aside className="hidden lg:flex flex-col items-center justify-between py-6 px-3 w-16 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl shadow-slate-200/50 fixed left-6 top-1/2 -translate-y-1/2 z-40">
      {/* Top Action */}
      <div className="space-y-4 flex flex-col items-center">
        <button
          type="button"
          onClick={onNewCase}
          title="New Recruitment Case"
          className="w-10 h-10 rounded-full bg-[#1E90FF] hover:bg-[#1877D2] text-white flex items-center justify-center shadow-lg shadow-[#1E90FF]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="w-8 border-t border-slate-200/80 my-1" />

        {/* Navigation / Action Icons */}
        <button
          type="button"
          onClick={isAnalyzing ? onStopAnalysis : onAnalyze}
          title={
            isAnalyzing
              ? "Stop Analysis"
              : evidenceCount > 0
              ? "Analyze Case"
              : "Add evidence to inspect"
          }
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${
            isAnalyzing
              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 animate-pulse"
              : "hover:bg-[#EAF4FF] text-slate-600 hover:text-[#1877D2]"
          }`}
        >
          {isAnalyzing ? (
            <span className="w-3.5 h-3.5 bg-rose-600 rounded-sm" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {evidenceCount > 0 && !isAnalyzing && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1E90FF]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("evidence-cards-deck");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Evidence Intake Cards"
          className="w-10 h-10 rounded-2xl hover:bg-[#EAF4FF] text-slate-600 hover:text-[#1877D2] flex items-center justify-center transition-all cursor-pointer"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("results-dossier");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Case Dossier"
          className="w-10 h-10 rounded-2xl hover:bg-[#EAF4FF] text-slate-600 hover:text-[#1877D2] flex items-center justify-center transition-all cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("verification-targets-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Verification Checklist"
          className="w-10 h-10 rounded-2xl hover:bg-[#EAF4FF] text-slate-600 hover:text-[#1877D2] flex items-center justify-center transition-all cursor-pointer"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Brand Logo Button */}
      <div className="pt-4">
        <div
          title="JobShield — Verify before you trust"
          className="w-10 h-10 rounded-2xl bg-[#EAF4FF] border border-[#B9DCFE] flex items-center justify-center shadow-xs"
        >
          <JobShieldIcon size={22} />
        </div>
      </div>
    </aside>
  );
}
