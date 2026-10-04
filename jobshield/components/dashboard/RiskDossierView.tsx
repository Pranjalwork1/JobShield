"use client";

import React, { useState, useMemo } from "react";
import { JobShieldCase } from "@/types/jobshield";
import { FindingCard } from "@/components/intelligence/FindingCard";
import { ContradictionsPanel } from "@/components/intelligence/ContradictionsPanel";
import { EvidenceTrail } from "@/components/intelligence/EvidenceTrail";
import { IntelligenceSummary } from "@/components/intelligence/IntelligenceSummary";
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { IntelligenceFinding } from "@/lib/intelligence/types";

interface RiskDossierViewProps {
  cases: JobShieldCase[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  initialSeverityFilter?: "all" | "high" | "medium" | "low";
  onClearFilter?: () => void;
  onNavigateSection: (section: string) => void;
}

export function RiskDossierView({
  cases,
  selectedCaseId,
  onSelectCase,
  initialSeverityFilter = "all",
  onClearFilter,
  onNavigateSection,
}: RiskDossierViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | "high" | "medium" | "low">(
    initialSeverityFilter
  );
  const [viewScope, setViewScope] = useState<"all" | "current">("current");

  const currentCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null;
    return cases.find((c) => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  // Aggregate findings based on view scope
  const targetFindings = useMemo(() => {
    let findingsList: (IntelligenceFinding & { caseTitle?: string; caseCompany?: string; caseId?: string })[] = [];

    if (viewScope === "current" && currentCase?.intelligence?.findings) {
      findingsList = currentCase.intelligence.findings.map((f) => ({
        ...f,
        caseTitle: currentCase.title || "Job Check",
        caseCompany: currentCase.company || "Unspecified Company",
        caseId: currentCase.id,
      }));
    } else if (viewScope === "all") {
      cases.forEach((c) => {
        if (c.intelligence?.findings) {
          c.intelligence.findings.forEach((f) => {
            findingsList.push({
              ...f,
              caseTitle: c.title || "Job Check",
              caseCompany: c.company || "Unspecified Company",
              caseId: c.id,
            });
          });
        }
      });
    }

    if (selectedSeverity === "all") return findingsList;
    return findingsList.filter((f) => f.severity === selectedSeverity);
  }, [cases, currentCase, viewScope, selectedSeverity]);

  // Count by severity
  const counts = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    const pool =
      viewScope === "current" && currentCase?.intelligence?.findings
        ? currentCase.intelligence.findings
        : cases.flatMap((c) => c.intelligence?.findings || []);

    pool.forEach((f) => {
      if (f.severity === "high") high++;
      else if (f.severity === "medium") medium++;
      else if (f.severity === "low") low++;
    });

    return { all: high + medium + low, high, medium, low };
  }, [cases, currentCase, viewScope]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Case Selector and Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Risk Dossier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Evidence-Backed Risk Findings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Empirical observations derived from verified recruitment evidence by JobShield P3.
          </p>
        </div>

        {/* Case Switcher & Scope Toggle */}
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

      {/* Filter Tabs: All, High, Medium, Low */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all" as const, label: "All Findings", count: counts.all },
          { id: "high" as const, label: "High Priority", count: counts.high },
          { id: "medium" as const, label: "Medium", count: counts.medium },
          { id: "low" as const, label: "Low", count: counts.low },
        ].map((tab) => {
          const isActive = selectedSeverity === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedSeverity(tab.id);
                if (tab.id === "all" && onClearFilter) onClearFilter();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1E90FF] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-[#F4F9FF]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-[#1877D2] text-white"
                    : "bg-slate-100 text-slate-600 font-mono"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary if looking at current case */}
      {viewScope === "current" && currentCase?.intelligence && (
        <IntelligenceSummary intelligence={currentCase.intelligence} />
      )}

      {/* Findings List */}
      <div className="space-y-4">
        {targetFindings.length === 0 ? (
          <div className="p-12 rounded-[24px] bg-white border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No {selectedSeverity !== "all" ? selectedSeverity : ""} findings observed
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {currentCase?.analysis
                ? "The evidence evaluated for this job check does not exhibit signals matching this severity level."
                : "This case has not been analyzed yet. Upload evidence and run analysis to populate the dossier."}
            </p>
            {!currentCase?.analysis && (
              <button
                type="button"
                onClick={() => onNavigateSection("intake")}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E90FF] text-white text-xs font-bold hover:bg-[#1877D2] active:bg-[#1565C0] shadow-md shadow-[#1E90FF]/25 border-none cursor-pointer"
              >
                <span>Go to Evidence Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {targetFindings.map((finding) => (
              <div key={finding.id} className="relative">
                {viewScope === "all" && finding.caseTitle && (
                  <div className="mb-1 text-[11px] font-bold text-slate-500 flex items-center gap-1.5 pl-2">
                    <span className="text-indigo-600">{finding.caseCompany}</span>
                    <span>•</span>
                    <span>{finding.caseTitle}</span>
                  </div>
                )}
                <FindingCard finding={finding} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contradictions & Evidence Trail if available */}
      {viewScope === "current" && currentCase?.intelligence && (
        <>
          {currentCase.intelligence.contradictions.length > 0 && (
            <ContradictionsPanel contradictions={currentCase.intelligence.contradictions} />
          )}
          <EvidenceTrail findings={currentCase.intelligence.findings} />
        </>
      )}
    </div>
  );
}
