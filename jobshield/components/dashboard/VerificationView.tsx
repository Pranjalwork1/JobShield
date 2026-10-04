"use client";

import React, { useState, useMemo } from "react";
import { JobShieldCase } from "@/types/jobshield";
import { VerificationItem } from "@/components/intelligence/VerificationItem";
import { BadgeCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { IntelligenceVerificationTarget } from "@/lib/intelligence/types";

interface VerificationViewProps {
  cases: JobShieldCase[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onToggleTarget: (caseId: string, targetId: string) => Promise<void>;
  onNavigateSection: (section: string) => void;
}

export function VerificationView({
  cases,
  selectedCaseId,
  onSelectCase,
  onToggleTarget,
  onNavigateSection,
}: VerificationViewProps) {
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [viewScope, setViewScope] = useState<"all" | "current">("current");

  const currentCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null;
    return cases.find((c) => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  // Aggregate targets
  const allTargetsWithContext = useMemo(() => {
    const list: {
      target: IntelligenceVerificationTarget;
      isCompleted: boolean;
      caseId: string;
      caseTitle: string;
      caseCompany: string;
    }[] = [];

    const targetCases = viewScope === "current" && currentCase ? [currentCase] : cases;

    targetCases.forEach((c) => {
      const targets = c.intelligence?.verificationTargets || [];
      const completedSet = new Set(c.completedVerificationTargets || []);

      targets.forEach((vt) => {
        const isCompleted = vt.status === "completed" || completedSet.has(vt.id);
        list.push({
          target: vt,
          isCompleted,
          caseId: c.id,
          caseTitle: c.title || "Job Check",
          caseCompany: c.company || "Unspecified Company",
        });
      });
    });

    return list;
  }, [cases, currentCase, viewScope]);

  const filteredTargets = useMemo(() => {
    if (filter === "all") return allTargetsWithContext;
    if (filter === "open") return allTargetsWithContext.filter((t) => !t.isCompleted);
    return allTargetsWithContext.filter((t) => t.isCompleted);
  }, [allTargetsWithContext, filter]);

  const completedCount = allTargetsWithContext.filter((t) => t.isCompleted).length;
  const openCount = allTargetsWithContext.filter((t) => !t.isCompleted).length;
  const totalCount = allTargetsWithContext.length;
  const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" />
            <span>Verification Queue</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Corroboration Action Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manual and corroborative verification targets generated to validate empirical claims.
          </p>
        </div>

        {/* Scope toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewScope("current")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewScope === "current"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Current Case
            </button>
            <button
              type="button"
              onClick={() => setViewScope("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewScope === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Cases
            </button>
          </div>

          {viewScope === "current" && cases.length > 1 && (
            <select
              value={currentCase?.id || ""}
              onChange={(e) => onSelectCase(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || "Job Check"} ({c.company || "Unspecified"})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#1E90FF] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("open")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "open"
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "completed"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {totalCount > 0 && rate !== null && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span>Progress: {rate}%</span>
            <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Targets List */}
      <div className="space-y-3">
        {filteredTargets.length === 0 ? (
          <div className="p-12 rounded-[24px] bg-white border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF4FF] border border-[#B9DCFE] text-[#1E90FF] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No verification targets in this view
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {totalCount === 0
                ? "Analyze a job check to automatically extract empirical claims and generate corroboration tasks."
                : "All targets in this category have been processed."}
            </p>
            {totalCount === 0 && (
              <button
                type="button"
                onClick={() => onNavigateSection("intake")}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E90FF] text-white text-xs font-bold hover:bg-[#1877D2] active:bg-[#1565C0] shadow-md shadow-[#1E90FF]/25 border-none cursor-pointer"
              >
                <span>Go to Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          filteredTargets.map(({ target, isCompleted, caseId, caseTitle, caseCompany }) => (
            <div key={`${caseId}-${target.id}`} className="space-y-1">
              {viewScope === "all" && (
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 pl-2">
                  <span className="text-[#1E90FF]">{caseCompany}</span>
                  <span>•</span>
                  <span>{caseTitle}</span>
                </div>
              )}
              <VerificationItem
                target={target}
                isCompleted={isCompleted}
                onToggle={() => onToggleTarget(caseId, target.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
