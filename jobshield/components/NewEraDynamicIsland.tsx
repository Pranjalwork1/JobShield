"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Square,
  Bot,
  Play,
  FileText,
  ChevronDown,
} from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";

interface NewEraDynamicIslandProps {
  currentCase: JobShieldCase | null;
  evidenceCount: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onStopAnalysis?: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  modelName?: string;
}

export function NewEraDynamicIsland({
  currentCase,
  evidenceCount,
  isAnalyzing,
  onAnalyze,
  onStopAnalysis,
  onLoadDemo,
  onReset,
  modelName = "Gemini Flash 3.8",
}: NewEraDynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasResults = !!currentCase?.analysis;
  const riskCount = currentCase?.analysis?.risk_indicators?.length ?? 0;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      {/* Dynamic Island Capsule */}
      <div
        className={`transition-all duration-300 ease-out bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/15 text-white shadow-2xl shadow-slate-950/30 rounded-full flex flex-col items-center ${
          isAnalyzing
            ? "ring-2 ring-cyan-400/70 shadow-cyan-500/25 px-5 py-2.5"
            : isExpanded
            ? "rounded-[32px] p-4 min-w-[340px] sm:min-w-[420px]"
            : "px-4 sm:px-5 py-2 hover:scale-[1.02]"
        }`}
      >
        {/* Main Capsule Row */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Left Indicator & State */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs font-bold text-cyan-300 tracking-wide">
                  Gemini AI Analyzing Evidence...
                </span>
              </div>
            ) : hasResults ? (
              <div className="flex items-center gap-2">
                {riskCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-bold text-slate-100">
                  {riskCount > 0
                    ? `${riskCount} Risk Indicator${riskCount === 1 ? "" : "s"} Isolated`
                    : "Verified Clean Dossier"}
                </span>
              </div>
            ) : evidenceCount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-100">
                  {evidenceCount} Evidence Item{evidenceCount === 1 ? "" : "s"} Attached
                </span>
                <span className="text-[11px] text-cyan-300 font-semibold hidden sm:inline">
                  • Ready
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-100">JobShield AI</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">• Standby</span>
              </div>
            )}

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAnalyzing ? (
              onStopAnalysis && (
                <button
                  type="button"
                  onClick={onStopAnalysis}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md shadow-rose-600/40 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-2.5 h-2.5 fill-white" />
                  <span>Stop</span>
                </button>
              )
            ) : (
              <>
                {evidenceCount > 0 && !hasResults && (
                  <button
                    type="button"
                    onClick={onAnalyze}
                    className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Check</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer border border-white/10"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Demo</span>
                </button>

                {(evidenceCount > 0 || hasResults) && (
                  <button
                    type="button"
                    onClick={onReset}
                    title="Reset Case"
                    className="p-1 rounded-full hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expanded HUD Content */}
        {isExpanded && !isAnalyzing && (
          <div className="w-full pt-3 mt-3 border-t border-white/10 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Engine: {modelName}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                Active Multimodal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>Evidence Files</span>
                </span>
                <p className="font-bold text-white text-xs">
                  {evidenceCount} Item{evidenceCount === 1 ? "" : "s"} Loaded
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Risk Status</span>
                </span>
                <p className="font-bold text-white text-xs">
                  {hasResults ? `${riskCount} Risk Indicators` : "Awaiting Run"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("evidence-cards-deck");
                  el?.scrollIntoView({ behavior: "smooth" });
                  setIsExpanded(false);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Go to Intake Deck →
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Minimize
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
