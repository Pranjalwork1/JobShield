"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  MessageSquare,
  Globe,
  ShieldAlert,
} from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";
import { getCaseEvidenceBreakdown } from "./EvidenceSummary";

interface ZentraHeroCardProps {
  currentCase: JobShieldCase;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onStopAnalysis?: () => void;
  onQuickPrompt?: (promptText: string) => void;
}

export function ZentraHeroCard({
  currentCase,
  isAnalyzing,
  onAnalyze,
  onStopAnalysis,
  onQuickPrompt,
}: ZentraHeroCardProps) {
  const [activeChip, setActiveChip] = useState("/offer-authenticity");

  const breakdown = getCaseEvidenceBreakdown(currentCase);
  const riskCount = currentCase.analysis?.risk_indicators?.length ?? 0;
  const highRiskCount =
    currentCase.analysis?.risk_indicators?.filter((r) => r.severity === "high").length ?? 0;

  const quickChips = [
    { id: "/offer-authenticity", label: "/offer-authenticity" },
    { id: "/recruiter-identity", label: "/recruiter-identity" },
    { id: "/wire-fraud-check", label: "/wire-fraud-check" },
    { id: "/salary-benchmark", label: "/salary-benchmark" },
  ];

  const handleChipClick = (chipId: string) => {
    setActiveChip(chipId);
    if (onQuickPrompt) {
      onQuickPrompt(chipId);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden space-y-6">
      {/* Top Header: Title & Action Button like "Payments" in ui final.webp */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Verification & Evidence Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Real-time multimodal signal mapping across document, pitch, and domain vectors
          </p>
        </div>

        <button
          type="button"
          className="w-9 h-9 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Volumetric Holographic Metric Columns with Striped 3D Blocks like in ui final.webp */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 pt-2">
        {/* Metric 1: PDF Documents */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">
              Offer Documents
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {breakdown.filesCount} File{breakdown.filesCount === 1 ? "" : "s"}
            </span>
          </div>

          {/* Striped Blue Holographic 3D Bar */}
          <div className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-600/30 border border-blue-400/40 relative overflow-hidden flex items-end p-2 group hover:border-blue-500 transition-all">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.4) 0, rgba(59, 130, 246, 0.4) 2px, transparent 2px, transparent 8px)",
              }}
            />
            <div className="w-full h-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl relative shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* Metric 2: Recruiter Pitch Message */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">
              Recruiter Pitch
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {breakdown.hasMessage ? "1 Intake" : "0 Intake"}
            </span>
          </div>

          {/* Striped Blue Holographic 3D Bar */}
          <div className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-indigo-600/30 border border-indigo-400/40 relative overflow-hidden flex items-end p-2 group hover:border-indigo-500 transition-all">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(99, 102, 241, 0.4) 0, rgba(99, 102, 241, 0.4) 2px, transparent 2px, transparent 8px)",
              }}
            />
            <div className="w-full h-3/4 bg-gradient-to-t from-indigo-600 to-blue-500 rounded-xl relative shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* Metric 3: Domain & Listing Context */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">
              Web Domain URL
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {breakdown.hasUrl ? "1 Target" : "0 Target"}
            </span>
          </div>

          {/* Striped Blue Holographic 3D Bar */}
          <div className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-sky-500/20 to-cyan-600/30 border border-sky-400/40 relative overflow-hidden flex items-end p-2 group hover:border-cyan-500 transition-all">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(14, 165, 233, 0.4) 0, rgba(14, 165, 233, 0.4) 2px, transparent 2px, transparent 8px)",
              }}
            />
            <div className="w-full h-2/3 bg-gradient-to-t from-cyan-600 to-sky-400 rounded-xl relative shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* Metric 4: Risk Indicators with Floating Tooltip like in ui final.webp */}
        <div className="space-y-3 relative">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">
              Risk Indicators
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              {riskCount} Flag{riskCount === 1 ? "" : "s"}
            </span>
          </div>

          {/* Floating Pill Tooltip like 48.6k transactions tooltip in ui final.webp */}
          <div className="absolute -top-7 right-0 z-20 pointer-events-none hidden sm:block">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg border border-slate-700 whitespace-nowrap">
              <span>{riskCount} signals • Severity: </span>
              <span className={highRiskCount > 0 ? "text-rose-400" : "text-amber-300"}>
                {highRiskCount > 0 ? "High" : "Moderate"}
              </span>
            </div>
          </div>

          {/* Striped Rose Holographic Bar */}
          <div className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-rose-500/20 to-red-600/30 border border-rose-400/40 relative overflow-hidden flex items-end p-2 group hover:border-rose-500 transition-all">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(244, 63, 94, 0.4) 0, rgba(244, 63, 94, 0.4) 2px, transparent 2px, transparent 8px)",
              }}
            />
            <div className="w-full h-1/2 bg-gradient-to-t from-red-600 to-rose-400 rounded-xl relative shadow-lg shadow-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
        </div>

        {/* Metric 5: Trust Status */}
        <div className="space-y-3 col-span-2 sm:col-span-1">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">
              Verification State
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate block">
              {currentCase.status === "analyzed"
                ? "Analyzed"
                : currentCase.status === "needs_verification"
                ? "Flagged"
                : "Draft"}
            </span>
          </div>

          {/* Striped Emerald / Amber Holographic Bar */}
          <div className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-teal-600/30 border border-emerald-400/40 relative overflow-hidden flex items-end p-2 group hover:border-emerald-500 transition-all">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(16, 185, 129, 0.4) 0, rgba(16, 185, 129, 0.4) 2px, transparent 2px, transparent 8px)",
              }}
            />
            <div className="w-full h-3/5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl relative shadow-lg shadow-emerald-500/30 flex items-center justify-center">
              {currentCase.status === "analyzed" ? (
                <CheckCircle2 className="w-6 h-6 text-white drop-shadow" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-white drop-shadow" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* The Signature Glassmorphic AI Prompt Dock (Exact Inspiration from ui final.webp) */}
      <div className="pt-2">
        <div className="rounded-[28px] p-3.5 sm:p-4 bg-gradient-to-r from-sky-100/80 via-blue-50/70 to-indigo-100/60 backdrop-blur-xl border border-sky-200/60 shadow-lg shadow-sky-500/5 space-y-3">
          {/* Header banner with sparkle and caret like in ui final.webp */}
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>What would you like to verify next?</span>
            </div>
            <span className="text-slate-400 text-xs">^</span>
          </div>

          {/* Prompt Capsule with interactive highlighted pill and Analyze button */}
          <div className="bg-white/95 rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 pl-2 flex-1 min-w-0">
              <span className="text-xs text-slate-600 font-medium">
                I want to investigate
              </span>

              {/* Interactive highlighted chips like "/successful payments" in ui final.webp */}
              <div className="flex flex-wrap items-center gap-1.5">
                {quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleChipClick(chip.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeChip === chip.id
                        ? "bg-amber-100/80 text-amber-900 border border-amber-300 shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{chip.label}</span>
                    {activeChip === chip.id && (
                      <span className="ml-1 text-amber-700 animate-pulse font-normal">|</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Analyze Button */}
            <div className="shrink-0 flex items-center gap-2">
              {isAnalyzing ? (
                onStopAnalysis && (
                  <button
                    type="button"
                    onClick={onStopAnalysis}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Stop Analysis</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white text-xs font-bold shadow-md shadow-[#1E90FF]/25 border-none transition-all active:scale-95 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Analyze with Gemini</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
