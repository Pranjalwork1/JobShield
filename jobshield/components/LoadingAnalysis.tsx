"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles, Shield } from "lucide-react";

interface LoadingAnalysisProps {
  currentStage?: number;
  onStopAnalysis?: () => void;
}

export function LoadingAnalysis({ currentStage = 2, onStopAnalysis }: LoadingAnalysisProps) {
  const [activeStep, setActiveStep] = useState(currentStage);

  const stages = [
    { id: 1, title: "Collecting recruitment evidence package" },
    { id: 2, title: "Preparing multimodal document & image representations" },
    { id: 3, title: "Gemini multimodal intelligence is analyzing the case" },
    { id: 4, title: "Validating facts, claims & risk indicators against evidence" },
    { id: 5, title: "Structuring findings & verification guidance" },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep((prev) => Math.max(prev, 2)), 600);
    const timer2 = setTimeout(() => setActiveStep((prev) => Math.max(prev, 3)), 2000);
    const timer3 = setTimeout(() => setActiveStep((prev) => Math.max(prev, 4)), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="rounded-[36px] bg-white/95 p-8 sm:p-12 border border-white/90 shadow-2xl shadow-slate-200/50 space-y-8 animate-in fade-in">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 flex items-center justify-center text-white shadow-xl shadow-slate-900/20 animate-pulse">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center text-slate-950">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            JobShield is analyzing your evidence
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
            Reasoning across documents, message texts, and job links to isolate observable facts from unverified claims.
          </p>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="max-w-md mx-auto space-y-3">
        {stages.map((stage) => {
          const isDone = stage.id < activeStep;
          const isCurrent = stage.id === activeStep;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                isDone
                  ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-800"
                  : isCurrent
                  ? "bg-slate-950 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "bg-slate-50/60 border-slate-100 text-slate-400"
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold">{stage.title}</span>
            </div>
          );
        })}
      </div>

      {/* Stop button in loading screen */}
      {onStopAnalysis && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onStopAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-sm" />
            <span>Stop Analysis</span>
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-[11px] text-slate-400 font-mono">
          Google Gemini Multimodal Intelligence • Server-Side Validation
        </p>
      </div>
    </div>
  );
}
