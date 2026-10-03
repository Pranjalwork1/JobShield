"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Bot,
  Menu,
  Plus,
  Square,
} from "lucide-react";

interface DynamicIslandNavbarProps {
  evidenceCount: number;
  isAnalyzing: boolean;
  hasResults: boolean;
  onLoadDemo: () => void;
  onReset: () => void;
  onNewCase?: () => void;
  onToggleMobileMenu?: () => void;
  onStopAnalysis?: () => void;
  modelName?: string;
}

export function DynamicIslandNavbar({
  evidenceCount,
  isAnalyzing,
  hasResults,
  onLoadDemo,
  onReset,
  onNewCase,
  onToggleMobileMenu,
  onStopAnalysis,
  modelName = "Gemini Flash 3.8",
}: DynamicIslandNavbarProps) {
  const [showModelInfo, setShowModelInfo] = useState(false);

  return (
    <header className="sticky top-2 sm:top-4 z-40 w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Floating Glassmorphic Capsule */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl shadow-slate-300/40 rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
        {/* Left: Mobile Menu & Model Pill */}
        <div className="flex items-center gap-2">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              title="Open Case Library"
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelInfo(!showModelInfo)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline font-bold">{modelName}</span>
              <span className="sm:hidden font-bold">Gemini</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showModelInfo && (
              <div className="absolute top-10 left-0 w-64 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl text-xs space-y-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Multimodal Engine</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Using official Google GenAI multimodal engine with document, image and structured JSON schema validation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Dynamic Island */}
        <div className="flex-1 flex justify-center">
          <div
            className={`flex items-center gap-2.5 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#0B0F19] text-white text-xs font-medium backdrop-blur-xl border border-slate-800 shadow-xl transition-all duration-300 ${
              isAnalyzing
                ? "ring-2 ring-cyan-400/60 scale-105 shadow-cyan-500/20"
                : hasResults
                ? "ring-1 ring-emerald-500/50"
                : "hover:scale-[1.02]"
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-cyan-300 font-bold tracking-wide">
                  Analyzing Case...
                </span>
                {onStopAnalysis && (
                  <button
                    type="button"
                    onClick={onStopAnalysis}
                    title="Stop and cancel analysis"
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] active:scale-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Square className="w-2.5 h-2.5 fill-white" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            ) : hasResults ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">
                  Case Dossier Ready
                </span>
              </>
            ) : evidenceCount > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-200 font-semibold truncate max-w-[140px] sm:max-w-none">
                  {evidenceCount} Evidence Item{evidenceCount > 1 ? "s" : ""}
                </span>
                <span className="text-cyan-300 font-bold hidden sm:inline ml-0.5">
                  • Ready
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-bold">JobShield AI</span>
                <span className="text-slate-400 hidden sm:inline">• Ready</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAnalyzing && onStopAnalysis ? (
            <button
              type="button"
              onClick={onStopAnalysis}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Stop Analysis</span>
              <span className="sm:hidden">Stop</span>
            </button>
          ) : (
            <>
              {onNewCase && (
                <button
                  type="button"
                  onClick={onNewCase}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0B0F19] text-white hover:bg-slate-800 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">New Check</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLoadDemo}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100/80 hover:bg-slate-200/90 text-slate-800 text-xs font-bold border border-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo</span>
              </button>
            </>
          )}

          {(evidenceCount > 0 || hasResults) && (
            <button
              type="button"
              onClick={onReset}
              title="Clear Current Case"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm transition-all active:scale-90 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
