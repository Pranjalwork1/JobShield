"use client";

import React from "react";
import { IntelligenceFinding } from "@/lib/intelligence/types";
import { FindingCard } from "./FindingCard";
import { ShieldCheck, Layers } from "lucide-react";

interface IntelligenceFindingsProps {
  findings: IntelligenceFinding[];
}

export function IntelligenceFindings({ findings }: IntelligenceFindingsProps) {
  if (findings.length === 0) {
    return (
      <div className="p-8 rounded-[32px] bg-white border border-slate-200/90 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">
          No Significant Evidence Findings
        </h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Deterministic evaluation did not detect upfront payment demands, credential requests, or email mismatches in the supplied documents.
        </p>
      </div>
    );
  }

  // Sort high priority first
  const sortedFindings = [...findings].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <section className="space-y-4" aria-label="Key Intelligence Findings">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Key Evidence Findings ({findings.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Traceable to specific text, uploaded files, or URLs.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedFindings.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </section>
  );
}
