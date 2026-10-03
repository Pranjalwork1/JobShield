"use client";

import React from "react";
import { JobShieldIntelligence } from "@/lib/intelligence/types";
import { ShieldAlert, AlertTriangle, CheckSquare, GitCompare, Info } from "lucide-react";

interface IntelligenceSummaryProps {
  intelligence: JobShieldIntelligence;
}

export function IntelligenceSummary({ intelligence }: IntelligenceSummaryProps) {
  const { summary } = intelligence;

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              JobShield Intelligence Engine
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Deterministic Layer
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Observed in supplied evidence • Requires independent verification
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Evidence-backed structured findings (No scam scores)</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Findings */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {summary.totalFindings}
            </p>
            <p className="text-xs font-bold text-slate-600">
              Evidence Findings
            </p>
            <p className="text-[11px] text-slate-400">
              {summary.highSeverityCount > 0 ? (
                <span className="text-rose-600 font-semibold">
                  {summary.highSeverityCount} high priority
                </span>
              ) : (
                "0 high priority"
              )}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-indigo-600 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Contradictions */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {summary.contradictionCount}
            </p>
            <p className="text-xs font-bold text-slate-600">
              Document Inconsistencies
            </p>
            <p className="text-[11px] text-slate-400">
              {summary.contradictionCount > 0
                ? "Conflicting facts across evidence"
                : "No cross-evidence conflicts"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-amber-600 flex items-center justify-center shadow-xs">
            <GitCompare className="w-5 h-5" />
          </div>
        </div>

        {/* Verification Queue */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {summary.verificationTargetCount}
            </p>
            <p className="text-xs font-bold text-slate-600">
              Items to Verify
            </p>
            <p className="text-[11px] text-slate-400">
              Actionable verification queue
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Neutral Investigation Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {summary.totalFindings > 0
            ? `${summary.totalFindings} evidence-backed finding${summary.totalFindings === 1 ? "" : "s"} require attention before proceeding. Always independently verify employers through official published channels.`
            : "No high-risk indicators were derived from the submitted evidence. Remember that absence of evidence is not proof of authenticity."}
        </p>
      </div>
    </div>
  );
}
