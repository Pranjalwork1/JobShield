"use client";

import React from "react";
import { IntelligenceFinding } from "@/lib/intelligence/types";
import { ArrowDown, Waypoints } from "lucide-react";

interface EvidenceTrailProps {
  findings: IntelligenceFinding[];
}

export function EvidenceTrail({ findings }: EvidenceTrailProps) {
  if (findings.length === 0) return null;

  return (
    <section className="space-y-4" aria-label="Evidence Audit Trail">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Waypoints className="w-4 h-4 text-[#1E90FF]" />
            <span>Evidence Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-400">
            Transparent tracing from structured findings to raw submitted evidence.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {findings.map((f, idx) => (
          <div
            key={`trail_${f.id}_${idx}`}
            className="p-5 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-3"
          >
            {/* Step 1: Finding */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#EAF4FF] border border-[#B9DCFE] text-[#1E90FF] flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                1
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#1877D2] uppercase tracking-wider">
                  Finding
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {f.title}
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="pl-3.5 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-300" />
            </div>

            {/* Step 2: Source Evidence */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                2
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Attributed Evidence
                </span>
                <p className="text-xs font-bold text-slate-700">
                  {f.evidence.map((e) => e.evidenceName).join(", ") || "Case Intake Evidence"}
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="pl-3.5 text-slate-300">
              <ArrowDown className="w-4 h-4 text-slate-300" />
            </div>

            {/* Step 3: Raw Observation */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                3
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Observed Text / Data
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-mono text-[11px] mt-1 leading-relaxed">
                  &ldquo;{f.observedEvidence}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
