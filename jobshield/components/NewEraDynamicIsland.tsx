"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Square,
  Bot,
  Play,
  FileText,
  ChevronDown,
} from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";

export interface NewEraDynamicIslandProps {
  currentCase: JobShieldCase | null;
  evidenceCount: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onStopAnalysis?: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  modelName?: string;
  className?: string;
  onNavigateToIntake?: () => void;
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
  className = "",
  onNavigateToIntake,
}: NewEraDynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasResults = !!currentCase?.analysis;
  const riskCount = currentCase?.analysis?.risk_indicators?.length ?? 0;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center text-xs ${className}`}
    >
      {/* Top Status Pill Capsule (Height 40px, Dodger Blue brand aesthetic) */}
      <div
        className={`h-10 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#EAF4FF] text-[#101828] border border-[#B9DCFE] shadow-xs transition-all duration-200 flex items-center gap-2 sm:gap-2.5 select-none ${
          isAnalyzing
            ? "ring-2 ring-[#1E90FF]/50 shadow-[#1E90FF]/20 border-[#1E90FF]"
            : "hover:border-[#1E90FF]/60 hover:bg-[#E1EFFF]"
        }`}
      >
        {/* Left Status Indicator & Text (Clickable to toggle details HUD) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Toggle investigation status details"
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-[#1E90FF] animate-spin shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[#1877D2] tracking-tight">
                Analyzing...
              </span>
            </div>
          ) : hasResults ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E90FF] animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[#101828] tracking-tight">
                <span className="hidden sm:inline">
                  {riskCount > 0
                    ? `${riskCount} Risk Indicator${riskCount === 1 ? "" : "s"} Isolated`
                    : "Verified Clean Dossier"}
                </span>
                <span className="sm:hidden">
                  {riskCount > 0 ? `${riskCount} risks` : "Clean"}
                </span>
              </span>
            </div>
          ) : evidenceCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E90FF] animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[#101828] tracking-tight">
                <span className="hidden sm:inline">
                  {evidenceCount} Evidence Item{evidenceCount === 1 ? "" : "s"} Attached
                </span>
                <span className="sm:hidden">{evidenceCount} items</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E90FF] animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[#101828] tracking-tight">
                JobShield AI
              </span>
              <span className="text-[10px] text-[#667085] font-normal hidden md:inline">
                • Standby
              </span>
            </div>
          )}

          <ChevronDown
            className={`w-3 h-3 text-[#1877D2] transition-transform duration-200 shrink-0 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Separator */}
        <div className="w-px h-3.5 bg-[#B9DCFE] shrink-0" />

        {/* Right Action Controls: Run / Stop / Demo / Reset */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {isAnalyzing ? (
            onStopAnalysis && (
              <button
                type="button"
                onClick={onStopAnalysis}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Stop Analysis"
              >
                <Square className="w-2 h-2 fill-white" />
                <span>Stop</span>
              </button>
            )
          ) : (
            <>
              {evidenceCount > 0 && !hasResults && (
                <button
                  type="button"
                  onClick={onAnalyze}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E90FF] hover:bg-[#1877D2] text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Run Gemini multimodal verification"
                >
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span className="hidden sm:inline">Run Check</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLoadDemo}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-[#DDF0FF] text-[#101828] text-[10px] font-semibold border border-[#B9DCFE] transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="Load sample verification case"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>Demo</span>
              </button>

              {(evidenceCount > 0 || hasResults) && (
                <button
                  type="button"
                  onClick={onReset}
                  title="Reset Case"
                  aria-label="Reset Case"
                  className="p-1 rounded-full hover:bg-[#DDF0FF] text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Expanded HUD Content Popover (Anchored inside shell, below pill) */}
      {isExpanded && !isAnalyzing && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-4 text-white z-50 animate-in fade-in zoom-in-95 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Engine: {modelName}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
              Active Multimodal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-400" />
                <span>Evidence Files</span>
              </span>
              <p className="font-bold text-white text-xs">
                {evidenceCount} Item{evidenceCount === 1 ? "" : "s"} Loaded
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Risk Status</span>
              </span>
              <p className="font-bold text-white text-xs">
                {hasResults ? `${riskCount} Risk Indicators` : "Awaiting Run"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                if (onNavigateToIntake) {
                  onNavigateToIntake();
                } else {
                  const el = document.getElementById("evidence-cards-deck");
                  el?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-[#1E90FF] hover:text-[#60A5FA] font-semibold cursor-pointer"
            >
              Go to Intake Deck →
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias for convenience
export const CaseStatusPill = NewEraDynamicIsland;
