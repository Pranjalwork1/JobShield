"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Clock,
  Briefcase,
  Code2,
  Palette,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import { RecentJobCheckItem } from "@/lib/dashboardMetrics";

interface RecentJobChecksProps {
  recentCases: RecentJobCheckItem[];
  onSelectCase: (caseId: string) => void;
  onViewAll?: () => void;
  onNewCase?: () => void;
  onLoadDemo?: () => void;
}

export function RecentJobChecks({
  recentCases,
  onSelectCase,
  onViewAll,
  onNewCase,
  onLoadDemo,
}: RecentJobChecksProps) {
  const [isInsightDismissed, setIsInsightDismissed] = useState(false);

  // Role icon determination
  const getRoleIcon = (roleTitle: string) => {
    const r = roleTitle.toLowerCase();
    if (r.includes("design") || r.includes("ux") || r.includes("ui") || r.includes("product")) {
      return (
        <div className="w-9 h-9 rounded-xl bg-[#EAF4FF] text-[#1E90FF] flex items-center justify-center shrink-0">
          <Palette className="w-4 h-4 stroke-[2.2]" />
        </div>
      );
    }
    if (r.includes("engineer") || r.includes("developer") || r.includes("software") || r.includes("tech")) {
      return (
        <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
          <Code2 className="w-4 h-4 stroke-[2.2]" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-[#EAF4FF] text-[#1E90FF] flex items-center justify-center shrink-0">
        <Briefcase className="w-4 h-4 stroke-[2.2]" />
      </div>
    );
  };

  // Risk findings badge
  const renderRiskFindings = (item: RecentJobCheckItem) => {
    if (item.rawStatus === "draft" || item.riskSeverity === "pending") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
          Pending
        </span>
      );
    }

    const hasHigh = (item.highFindingsCount ?? 0) > 0;
    const hasMed = (item.mediumFindingsCount ?? 0) > 0;
    const hasLow = (item.lowFindingsCount ?? 0) > 0;

    if (!hasHigh && !hasMed && !hasLow) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[#E6F8F0] text-[#00A86B] border border-[#A3E9C9]">
          0
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {hasHigh && (
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold bg-[#FEECEC] text-[#EF4444] border border-[#FCA5A5]">
            {item.highFindingsCount}
          </span>
        )}
        {hasMed && (
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold bg-[#FEF5E7] text-[#D97706] border border-[#FCD34D]">
            {item.mediumFindingsCount}
          </span>
        )}
        {hasLow && (
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold bg-[#EAF4FF] text-[#1E90FF] border border-[#B9DCFE]">
            {item.lowFindingsCount}
          </span>
        )}
      </div>
    );
  };

  // Status badge with dot
  const renderStatus = (item: RecentJobCheckItem) => {
    switch (item.status) {
      case "Analyzed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Verified
          </span>
        );
      case "Needs Verification":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In progress
          </span>
        );
      case "Analyzing":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E90FF] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E90FF]" />
            Analyzing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
    }
  };

  // Check if we can show a meaningful AI Insight card
  const caseWithRisk = recentCases.find(
    (c) => (c.highFindingsCount ?? 0) > 0 || (c.mediumFindingsCount ?? 0) > 0
  );

  return (
    <div className="relative rounded-[22px] bg-white border border-slate-200/80 shadow-xs p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#10264C] tracking-tight">
            Recent job checks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Live status across your active verification queue
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#1E90FF] hover:border-[#B9DCFE] transition-all cursor-pointer shadow-2xs"
          >
            <span>All checks</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {recentCases.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">No job checks yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create a new job check to upload offer letters or load the sample demo case.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="px-3.5 py-1.5 rounded-xl border border-[#B9DCFE] bg-white text-xs font-semibold text-[#1E90FF] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
              >
                Load Demo Case
              </button>
            )}
            {onNewCase && (
              <button
                type="button"
                onClick={onNewCase}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1E90FF] text-white text-xs font-bold hover:bg-[#1877D2] transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Job Check</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3 font-semibold">ROLE / CHECK</th>
                  <th className="py-3.5 px-3 font-semibold">COMPANY</th>
                  <th className="py-3.5 px-3 font-semibold">RISK FINDINGS</th>
                  <th className="py-3.5 px-3 font-semibold">STATUS</th>
                  <th className="py-3.5 px-3 font-semibold">UPDATED</th>
                  <th className="py-3.5 px-3 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCases.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item.id)}
                    className="group hover:bg-[#F5F7FB]/70 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(item.role)}
                        <div>
                          <div className="font-bold text-sm text-[#10264C] group-hover:text-[#1E90FF] transition-colors">
                            {item.role}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            ID #{item.displayId} · Applied {item.appliedDate || "Recently"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-sm font-semibold text-slate-700">
                      {item.company}
                    </td>

                    <td className="py-4 px-3">
                      {renderRiskFindings(item)}
                    </td>

                    <td className="py-4 px-3">
                      {renderStatus(item)}
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-400 font-medium">
                      {item.updated}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(item.id);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#1E90FF] hover:border-[#B9DCFE] bg-white group-hover:bg-[#EAF4FF] transition-all cursor-pointer shadow-2xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100 pt-1">
            {recentCases.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCase(item.id)}
                className="py-4 space-y-2.5 active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {getRoleIcon(item.role)}
                    <div>
                      <h4 className="font-bold text-sm text-[#10264C]">
                        {item.role}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.company}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    ID #{item.displayId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {renderRiskFindings(item)}
                    {renderStatus(item)}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.updated}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Floating AI Insight Card (Lower-right area as in PDF) */}
          {caseWithRisk && !isInsightDismissed && (
            <div className="sm:absolute sm:bottom-4 sm:right-6 mt-4 sm:mt-0 max-w-sm rounded-2xl bg-white border border-[#B9DCFE] shadow-lg p-3.5 z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-2 pb-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1E90FF]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E90FF]" />
                  <span>AI INSIGHT</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInsightDismissed(true)}
                  className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Dismiss AI insight"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <p
                onClick={() => onSelectCase(caseWithRisk.id)}
                className="text-xs text-[#10264C] font-medium leading-relaxed hover:text-[#1E90FF] transition-colors cursor-pointer"
              >
                Risk isolated in {caseWithRisk.company} application. Should we expedite verification?
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
