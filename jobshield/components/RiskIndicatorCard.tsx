"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, FileSearch } from "lucide-react";
import { RiskIndicator } from "@/lib/schemas";

interface RiskIndicatorCardProps {
  indicator: RiskIndicator;
}

export function RiskIndicatorCard({ indicator }: RiskIndicatorCardProps) {
  const getSeverityStyle = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-red-50 text-red-700 border-red-200",
          card: "border-red-100 bg-red-50/20 hover:border-red-200",
          icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
          label: "HIGH RISK FACTOR",
        };
      case "medium":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          card: "border-amber-100 bg-amber-50/20 hover:border-amber-200",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          label: "MEDIUM RISK FACTOR",
        };
      case "low":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          card: "border-blue-100 bg-blue-50/20 hover:border-blue-200",
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          label: "LOW / INFORMATIONAL",
        };
    }
  };

  const style = getSeverityStyle(indicator.severity);

  return (
    <div
      className={`p-6 rounded-[28px] border shadow-sm transition-all duration-200 space-y-4 bg-white/95 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            {style.icon}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              {indicator.indicator}
            </h4>
            <span className="text-xs text-slate-400">
              Sourced from: <strong className="text-slate-700">{indicator.evidence_reference}</strong>
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shrink-0 ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      <div className="space-y-2.5 text-sm pl-2">
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Observed Evidence
          </div>
          <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
            &ldquo;{indicator.observed_evidence}&rdquo;
          </p>
        </div>

        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Why It Matters
          </div>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {indicator.explanation}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 border-t border-slate-100">
          <FileSearch className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Evidence Reference:{" "}
            <span className="font-semibold text-slate-800">
              {indicator.evidence_reference}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
