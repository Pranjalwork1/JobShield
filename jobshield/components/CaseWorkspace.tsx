"use client";

import React, { useRef, useEffect, useState } from "react";
import { JobShieldCase, Evidence } from "@/types/jobshield";
import { CaseHeader } from "./CaseHeader";
import { ZentraHeroCard } from "./ZentraHeroCard";
import { IntakeCardDeck } from "./IntakeCardDeck";
import { BottomConsole } from "./BottomConsole";
import { LoadingAnalysis } from "./LoadingAnalysis";
import { AnalysisResult } from "./AnalysisResult";
import { ErrorState } from "./ErrorState";
import { RefreshCw, Layers, Sparkles } from "lucide-react";
import { IntelligenceSummary } from "./intelligence/IntelligenceSummary";
import { IntelligenceFindings } from "./intelligence/IntelligenceFindings";
import { ContradictionsPanel } from "./intelligence/ContradictionsPanel";
import { EvidenceTrail } from "./intelligence/EvidenceTrail";
import { VerificationQueue } from "./intelligence/VerificationQueue";
import { CaseTimeline } from "./intelligence/CaseTimeline";

interface CaseWorkspaceProps {
  currentCase: JobShieldCase;
  folderName: string;
  onUpdateCase: (updated: Partial<JobShieldCase>) => Promise<void>;
  onAnalyze: () => Promise<void>;
  onRetryIntelligence?: () => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
  onClearError: () => void;
  onMove: () => void;
  onRename: () => void;
  onDelete: () => void;
  onLoadDemo: () => void;
  onStopAnalysis?: () => void;
}

export function CaseWorkspace({
  currentCase,
  folderName,
  onUpdateCase,
  onAnalyze,
  onRetryIntelligence,
  isAnalyzing,
  error,
  onClearError,
  onMove,
  onRename,
  onDelete,
  onLoadDemo,
  onStopAnalysis,
}: CaseWorkspaceProps) {
  // Update evidence items
  const handleFilesAdded = async (newItems: Evidence[]) => {
    const updatedList = [...currentCase.evidence, ...newItems];
    await onUpdateCase({ evidence: updatedList });
  };

  const handleRemoveEvidence = async (id: string) => {
    const updatedList = currentCase.evidence.filter((e) => e.id !== id);
    await onUpdateCase({ evidence: updatedList });
  };

  const handleClearAll = async () => {
    await onUpdateCase({
      evidence: [],
      recruiterMessage: "",
      jobUrl: "",
      analysis: null,
      status: "draft",
      completedVerificationTargets: [],
    });
  };

  const handleMessageChange = async (val: string) => {
    await onUpdateCase({ recruiterMessage: val });
  };

  const handleJobUrlChange = async (val: string) => {
    await onUpdateCase({ jobUrl: val });
  };

  const handleToggleVerificationTarget = async (targetText: string) => {
    const currentList = currentCase.completedVerificationTargets || [];
    let updatedList: string[];
    if (currentList.includes(targetText)) {
      updatedList = currentList.filter((t) => t !== targetText);
    } else {
      updatedList = [...currentList, targetText];
    }
    await onUpdateCase({ completedVerificationTargets: updatedList });
  };

  // 1. Ref for the analysis section scroll target
  const analysisSectionRef = useRef<HTMLDivElement | null>(null);
  const prevAnalyzingRef = useRef(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // 2. Auto-scroll effect triggered ONLY when analysis starts (Analyze or Re-analyze)
  useEffect(() => {
    const justStartedAnalyzing = !prevAnalyzingRef.current && isAnalyzing;
    const justFinished = prevAnalyzingRef.current && !isAnalyzing && Boolean(currentCase.analysis);
    const justFailed = prevAnalyzingRef.current && !isAnalyzing && Boolean(error);
    prevAnalyzingRef.current = isAnalyzing;

    if (justStartedAnalyzing) {
      setLiveAnnouncement("JobShield is analyzing your evidence.");

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Use requestAnimationFrame to ensure the analysis section has mounted in DOM
      requestAnimationFrame(() => {
        if (analysisSectionRef.current) {
          analysisSectionRef.current.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    } else if (justFinished) {
      setLiveAnnouncement("JobShield analysis completed.");
    } else if (justFailed) {
      setLiveAnnouncement("JobShield analysis could not be completed.");
    }
  }, [isAnalyzing, currentCase.analysis, error]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Overview Section */}
      <div id="section-overview" className="space-y-8 scroll-mt-24">
        {/* Case Header */}
        <CaseHeader
          currentCase={currentCase}
          folderName={folderName}
          onMove={onMove}
          onRename={onRename}
          onDelete={onDelete}
        />

        {/* Zentra Volumetric Matrix & AI Prompt Dock matching ui final.webp */}
        <ZentraHeroCard
          currentCase={currentCase}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
          onStopAnalysis={onStopAnalysis}
        />
      </div>

      {/* 2. Analysis Section: Loading, Error, and Intelligence Dossier */}
      <div
        ref={analysisSectionRef}
        id="section-analysis-container"
        className="scroll-mt-20 sm:scroll-mt-24 space-y-6 focus:outline-none"
        tabIndex={-1}
      >
        {/* Screen Reader Live Region for accessible status announcements */}
        <div className="sr-only" aria-live="polite" role="status">
          {liveAnnouncement}
        </div>

        {/* 2a. Analyzing State */}
        {isAnalyzing && <LoadingAnalysis onStopAnalysis={onStopAnalysis} />}

        {/* 2b. Error State */}
        {error && !isAnalyzing && (
          <ErrorState
            error={error}
            onRetry={onAnalyze}
            onReset={onClearError}
          />
        )}

        {/* 2c. Analysis Results & P3 Intelligence (if analyzed) */}
        {currentCase.analysis && !isAnalyzing && (
          <div id="section-dossier" className="space-y-6">
            {/* P2 Gemini Analysis Dossier */}
            <AnalysisResult
              analysis={currentCase.analysis}
              onReset={handleClearAll}
              completedTargets={currentCase.completedVerificationTargets || []}
              onToggleTarget={handleToggleVerificationTarget}
            />

            {/* P3 JobShield Intelligence Layer */}
            {currentCase.intelligence && (
              <div id="section-intelligence" className="space-y-6 pt-2">
                <IntelligenceSummary intelligence={currentCase.intelligence} />

                <IntelligenceFindings findings={currentCase.intelligence.findings} />

                {currentCase.intelligence.contradictions.length > 0 && (
                  <ContradictionsPanel
                    contradictions={currentCase.intelligence.contradictions}
                  />
                )}

                <EvidenceTrail findings={currentCase.intelligence.findings} />

                <VerificationQueue
                  targets={currentCase.intelligence.verificationTargets}
                  completedTargets={currentCase.completedVerificationTargets || []}
                  onToggleTarget={handleToggleVerificationTarget}
                />
              </div>
            )}

            {/* Action Bar for Re-analysis and Retry Intelligence */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-6 rounded-[32px] bg-white/80 border border-slate-100 shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  JobShield Intelligence Actions
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Re-evaluate deterministic rules locally, or re-run Gemini multimodal analysis with new evidence.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {onRetryIntelligence && (
                  <button
                    type="button"
                    onClick={onRetryIntelligence}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EAF4FF] hover:bg-[#DDF0FF] text-[#1877D2] font-bold text-xs border border-[#B9DCFE] shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title="Re-run deterministic P3 rules on existing analysis without calling Gemini API"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1E90FF]" />
                    <span>Retry Intelligence</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white font-bold text-xs shadow-md shadow-[#1E90FF]/25 border-none transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-analyze Case</span>
                </button>
              </div>
            </div>

            {/* Case Activity Timeline */}
            {currentCase.timeline && currentCase.timeline.length > 0 && (
              <CaseTimeline timeline={currentCase.timeline} />
            )}
          </div>
        )}
      </div>

      {/* 5. Evidence Intake Area (Always accessible to view/add evidence) */}
      <div id="section-intake" className="space-y-6 pt-2 scroll-mt-24">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Recruitment Evidence Intake</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evidence added here belongs strictly to this job case.
            </p>
          </div>
        </div>

        {/* 3 Elevated Intake Cards Deck with Mascot */}
        <IntakeCardDeck
          onFilesAdded={handleFilesAdded}
          onOpenMessageInput={() => {
            const el = document.querySelector("textarea");
            el?.focus();
          }}
          onOpenUrlInput={() => {
            const el = document.querySelector("textarea");
            el?.focus();
          }}
          evidenceList={currentCase.evidence}
        />

        {/* Bottom Console for message text, job URL, attached chips and Analyze CTA */}
        <BottomConsole
          messageText={currentCase.recruiterMessage}
          onMessageChange={handleMessageChange}
          jobUrl={currentCase.jobUrl}
          onJobUrlChange={handleJobUrlChange}
          evidenceList={currentCase.evidence}
          onRemoveEvidence={handleRemoveEvidence}
          onFilesAdded={handleFilesAdded}
          onLoadDemo={onLoadDemo}
          onClearAll={handleClearAll}
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          onStopAnalysis={onStopAnalysis}
        />
      </div>
    </div>
  );
}
