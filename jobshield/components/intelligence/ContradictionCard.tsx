"use client";

import React from "react";
import { Contradiction } from "@/lib/intelligence/types";
import { GitCompare, FileText } from "lucide-react";

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export function ContradictionCard({ contradiction }: ContradictionCardProps) {
  const getSeverityBadge = () => {
    switch (contradiction.severity) {
      case "high":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold uppercase">
            High Discrepancy
          </span>
        );
      case "medium":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
            Inconsistency
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-amber-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                {contradiction.field.replace(/_/g, " ")} Mismatch
              </span>
              {getSeverityBadge()}
            </div>
            <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
              {contradiction.title}
            </h4>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {contradiction.explanation}
      </p>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {contradiction.values.map((v, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evidence {idx === 0 ? "A" : "B"}: {v.evidence.evidenceName}</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs break-words">
              {v.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
