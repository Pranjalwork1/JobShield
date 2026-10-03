"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { JobShieldCase, JobShieldFolder, Evidence } from "@/types/jobshield";
import { JobShieldAnalysis } from "@/lib/schemas";
import {
  getFolders,
  createFolder as dbCreateFolder,
  getCases,
  getCaseById as dbGetCaseById,
  saveCase as dbSaveCase,
  createCase as dbCreateCase,
  deleteCase as dbDeleteCase,
  moveCase as dbMoveCase,
  SYSTEM_ALL_JOBS_ID,
  DEFAULT_MY_JOBS_ID,
} from "@/lib/caseStore";
import { NewEraDynamicIsland } from "@/components/NewEraDynamicIsland";
import { ZentraTopNav } from "@/components/ZentraTopNav";
import { CaseWorkspace } from "@/components/CaseWorkspace";
import { RobotMascot } from "@/components/RobotMascot";
import { CreateCaseDialog } from "@/components/CreateCaseDialog";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { MoveCaseDialog } from "@/components/MoveCaseDialog";
import { RenameCaseDialog } from "@/components/RenameCaseDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { DEMO_CASE_MESSAGE, DEMO_CASE_URL } from "@/lib/demoData";
import { FolderPlus, Plus, ShieldCheck, Loader2 } from "lucide-react";
import { getCaseEvidenceBreakdown } from "@/components/EvidenceSummary";

export default function JobShieldPage() {
  const [folders, setFolders] = useState<JobShieldFolder[]>([]);
  const [cases, setCases] = useState<JobShieldCase[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(SYSTEM_ALL_JOBS_ID);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Dialog States
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [caseToMove, setCaseToMove] = useState<JobShieldCase | null>(null);
  const [caseToRename, setCaseToRename] = useState<JobShieldCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<JobShieldCase | null>(null);

  // 1. Load Initial Data from IndexedDB on Mount
  useEffect(() => {
    let cancelled = false;

    async function initializeStore() {
      try {
        const [fetchedFolders, fetchedCases] = await Promise.all([
          getFolders(),
          getCases(),
        ]);

        if (cancelled) return;

        setFolders(fetchedFolders);
        setCases(fetchedCases);

        // Restore selectedFolderId
        const storedFolder = localStorage.getItem("jobshield_selected_folder_id");
        if (
          storedFolder &&
          (storedFolder === SYSTEM_ALL_JOBS_ID || fetchedFolders.some((f) => f.id === storedFolder))
        ) {
          setSelectedFolderId(storedFolder);
        } else {
          setSelectedFolderId(SYSTEM_ALL_JOBS_ID);
        }

        // Restore selectedCaseId
        const storedCase = localStorage.getItem("jobshield_selected_case_id");
        if (storedCase && fetchedCases.some((c) => c.id === storedCase)) {
          setSelectedCaseId(storedCase);
        } else if (fetchedCases.length > 0) {
          setSelectedCaseId(fetchedCases[0].id);
        } else {
          setSelectedCaseId(null);
        }
      } catch (err) {
        console.error("Failed to load initial data from IndexedDB:", err);
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    initializeStore();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync selection to localStorage
  useEffect(() => {
    if (selectedFolderId) {
      localStorage.setItem("jobshield_selected_folder_id", selectedFolderId);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    if (selectedCaseId) {
      localStorage.setItem("jobshield_selected_case_id", selectedCaseId);
    } else {
      localStorage.removeItem("jobshield_selected_case_id");
    }
  }, [selectedCaseId]);

  // 2. Identify Current Case
  const currentCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const folderNameMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // Current evidence count across files + message + url using unified formula
  const currentEvidenceCount = useMemo(() => {
    return getCaseEvidenceBreakdown(currentCase).total;
  }, [currentCase]);

  // 3. Folder Operations
  const handleCreateFolder = async (name: string) => {
    const newFolder = await dbCreateFolder(name);
    setFolders((prev) => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
  };

  // 4. Case Operations
  const handleCreateCase = async (params: {
    title?: string;
    company?: string;
    folderId: string;
  }) => {
    const newCase = await dbCreateCase(params);
    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setSelectedFolderId(newCase.folderId);
  };

  const handleUpdateCase = async (updates: Partial<JobShieldCase>) => {
    if (!currentCase) return;

    const updated: JobShieldCase = {
      ...currentCase,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update in-memory state immediately for zero-lag UI
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    // Persist to IndexedDB
    try {
      await dbSaveCase(updated);
    } catch (err) {
      console.error("Failed to persist case update to IndexedDB:", err);
    }
  };

  const handleMoveCase = async (caseId: string, targetFolderId: string) => {
    await dbMoveCase(caseId, targetFolderId);
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, folderId: targetFolderId, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const handleRenameCase = async (caseId: string, title: string, company: string) => {
    const target = cases.find((c) => c.id === caseId);
    if (!target) return;
    const updated = {
      ...target,
      title: title.trim() || null,
      company: company.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    await dbSaveCase(updated);
    setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    await dbDeleteCase(caseToDelete.id);
    const remaining = cases.filter((c) => c.id !== caseToDelete.id);
    setCases(remaining);

    if (selectedCaseId === caseToDelete.id) {
      setSelectedCaseId(remaining.length > 0 ? remaining[0].id : null);
    }
    setCaseToDelete(null);
  };

  // 5. 1-Click Demo Case Loader
  const handleLoadDemoCase = async () => {
    try {
      // Fetch sample files from public/samples
      const pdfRes = await fetch("/samples/fake-offer-letter.pdf");
      const pdfBlob = await pdfRes.blob();
      const pdfFile = new File([pdfBlob], "fake-offer-letter.pdf", {
        type: "application/pdf",
      });

      const pngRes = await fetch("/samples/whatsapp-screenshot.png");
      const pngBlob = await pngRes.blob();
      const pngFile = new File([pngBlob], "whatsapp-screenshot.png", {
        type: "image/png",
      });

      const demoEvidence: Evidence[] = [
        {
          id: `file_${Date.now()}_1`,
          type: "pdf",
          name: "fake-offer-letter.pdf",
          mimeType: "application/pdf",
          size: pdfFile.size,
          file: pdfFile,
        },
        {
          id: `file_${Date.now()}_2`,
          type: "image",
          name: "whatsapp-screenshot.png",
          mimeType: "image/png",
          size: pngFile.size,
          file: pngFile,
        },
      ];

      if (currentCase) {
        // Populate the currently open case with demo assets (Section 14)
        const updatedCase: JobShieldCase = {
          ...currentCase,
          title: "Software Developer",
          company: "ABC Technologies",
          recruiterMessage: DEMO_CASE_MESSAGE,
          jobUrl: DEMO_CASE_URL,
          evidence: demoEvidence,
          analysis: null,
          status: "draft",
          completedVerificationTargets: [],
          updatedAt: new Date().toISOString(),
        };

        setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
        await dbSaveCase(updatedCase);
      } else {
        // If no case is selected or exists, create a brand-new demo case
        const targetFolder =
          selectedFolderId === SYSTEM_ALL_JOBS_ID ? DEFAULT_MY_JOBS_ID : selectedFolderId;
        const newDemoCase = await dbCreateCase({
          title: "Software Developer",
          company: "ABC Technologies",
          folderId: targetFolder,
        });

        newDemoCase.recruiterMessage = DEMO_CASE_MESSAGE;
        newDemoCase.jobUrl = DEMO_CASE_URL;
        newDemoCase.evidence = demoEvidence;

        await dbSaveCase(newDemoCase);
        setCases((prev) => [newDemoCase, ...prev]);
        setSelectedCaseId(newDemoCase.id);
      }
    } catch (err) {
      console.warn("Could not load local demo files, setting text fallback:", err);
      if (currentCase) {
        await handleUpdateCase({
          recruiterMessage: DEMO_CASE_MESSAGE,
          jobUrl: DEMO_CASE_URL,
        });
      }
    }
  };

  // AbortController for stopping ongoing Gemini analysis on demand
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopAnalysis = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisError("Analysis was cancelled by user. Your evidence has been preserved in draft mode.");
    if (selectedCaseId) {
      await handleUpdateCase({ status: "draft" });
    }
  };

  // 6. Gemini Multimodal Analysis for Current Case (Requirement 19, 39, 40)
  const handleAnalyzeCase = async () => {
    if (!selectedCaseId) return;

    // Load exact case and hydrated files from IndexedDB (Section 19)
    const storedCase = await dbGetCaseById(selectedCaseId);
    const targetCase = storedCase || currentCase;
    if (!targetCase) return;

    const breakdown = getCaseEvidenceBreakdown(targetCase);
    if (breakdown.total === 0) return;

    // Initialize AbortController for cancel capability
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAnalyzing(true);
    setAnalysisError(null);

    // Set case status to "analyzing"
    await handleUpdateCase({ status: "analyzing" });

    try {
      const formData = new FormData();

      // Only send evidence from the currently selected case
      targetCase.evidence.forEach((item: Evidence) => {
        if (item.file) {
          formData.append("files", item.file);
        }
      });

      if (targetCase.recruiterMessage?.trim()) {
        formData.append("message", targetCase.recruiterMessage.trim());
      }

      if (targetCase.jobUrl?.trim()) {
        formData.append("url", targetCase.jobUrl.trim());
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "JobShield couldn't complete the analysis. Your evidence has not been classified as safe or unsafe. Please try again."
        );
      }

      const analysis: JobShieldAnalysis = data.analysis;

      // Status logic: if verification targets exist and need review -> "needs_verification", else "analyzed"
      const hasVerificationTargets = (analysis.verification_targets?.length ?? 0) > 0;
      const nextStatus = hasVerificationTargets ? "needs_verification" : "analyzed";

      // Auto-extract title and company following Section 21
      const derivedTitle =
        analysis.case_summary?.job_title || targetCase.title || null;
      const derivedCompany =
        analysis.case_summary?.company || targetCase.company || null;

      await handleUpdateCase({
        analysis,
        status: nextStatus,
        title: derivedTitle,
        company: derivedCompany,
        lastAnalyzedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("[JobShield] Analysis stopped by user.");
        setAnalysisError("Analysis was stopped. Your evidence remains saved in draft mode.");
        await handleUpdateCase({ status: "draft" });
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred connecting to JobShield. Please try again.";
      setAnalysisError(message);
      // Revert status to draft on failure
      await handleUpdateCase({ status: "draft" });
    } finally {
      abortControllerRef.current = null;
      setIsAnalyzing(false);
    }
  };

  const handleResetCurrentCase = async () => {
    if (!currentCase) return;
    await handleUpdateCase({
      evidence: [],
      recruiterMessage: "",
      jobUrl: "",
      analysis: null,
      status: "draft",
      completedVerificationTargets: [],
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#e5e8ee] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs font-semibold tracking-wide">Loading JobShield Investigation Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900 pb-12 bg-[#e5e8ee]">
      {/* Top Floating Glassmorphic New Era Dynamic Island */}
      <NewEraDynamicIsland
        currentCase={currentCase}
        evidenceCount={currentEvidenceCount}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyzeCase}
        onStopAnalysis={handleStopAnalysis}
        onLoadDemo={handleLoadDemoCase}
        onReset={handleResetCurrentCase}
      />

      {/* Main Elevated Application Canvas matching ui final.webp */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 pt-16 sm:pt-20">
        <div className="rounded-[36px] sm:rounded-[44px] p-4 sm:p-7 lg:p-9 min-h-[92vh] flex flex-col justify-between relative bg-white border border-slate-200/80 shadow-2xl shadow-slate-300/30">
          {/* Top Brand & Segmented Nav */}
          <ZentraTopNav
            currentCase={currentCase}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => {
              setSelectedFolderId(id);
              const folderCases =
                id === SYSTEM_ALL_JOBS_ID
                  ? cases
                  : cases.filter((c) => c.folderId === id);
              if (folderCases.length > 0) {
                setSelectedCaseId(folderCases[0].id);
              }
            }}
            onNewCase={() => setIsCreateCaseOpen(true)}
            onCreateFolder={handleCreateFolder}
            onLoadDemo={handleLoadDemoCase}
            activeSection={activeSection}
            onSelectSection={(sec) => {
              setActiveSection(sec);
              const target = document.getElementById(`section-${sec}`);
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />

          {/* Full-width Workspace Canvas */}
          <main className="flex-1 w-full mb-4">
            <section className="w-full">
              {currentCase ? (
                <CaseWorkspace
                  currentCase={currentCase}
                  folderName={folderNameMap.get(currentCase.folderId) || "My Jobs"}
                  onUpdateCase={handleUpdateCase}
                  onAnalyze={handleAnalyzeCase}
                  isAnalyzing={isAnalyzing}
                  onStopAnalysis={handleStopAnalysis}
                  error={analysisError}
                  onClearError={() => setAnalysisError(null)}
                  onMove={() => setCaseToMove(currentCase)}
                  onRename={() => setCaseToRename(currentCase)}
                  onDelete={() => setCaseToDelete(currentCase)}
                  onLoadDemo={handleLoadDemoCase}
                />
              ) : (
                /* Empty State (Requirement 30) */
                <div className="p-8 sm:p-14 rounded-[36px] bg-white/80 border border-slate-200/80 shadow-sm text-center space-y-6 max-w-xl mx-auto my-12 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Your JobShield workspace is empty
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Create a folder to organize your job investigations, or start your first job check to intake recruitment evidence and run Gemini multimodal analysis.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateFolderOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-indigo-600" />
                      <span>+ Create Folder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateCaseOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ New Job Check</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Fixed Sticky Robot Mascot at bottom-right of the viewport (remains stuck on scroll) */}
      <aside
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto"
        aria-label="JobShield AI Assistant"
      >
        <RobotMascot
          onClick={() => {
            const el =
              document.getElementById("evidence-cards-deck") ||
              document.querySelector("textarea");
            el?.scrollIntoView({ behavior: "smooth" });
            const textarea = document.querySelector("textarea");
            textarea?.focus();
          }}
          bubbleText="Hey there! 👋"
          subText="Need a verify check?"
        />
      </aside>

      {/* Global Dialogs */}
      <CreateCaseDialog
        isOpen={isCreateCaseOpen}
        onClose={() => setIsCreateCaseOpen(false)}
        folders={folders}
        defaultFolderId={selectedFolderId}
        onCreate={handleCreateCase}
      />

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <MoveCaseDialog
        isOpen={!!caseToMove}
        onClose={() => setCaseToMove(null)}
        caseItem={caseToMove}
        folders={folders}
        onMove={handleMoveCase}
      />

      <RenameCaseDialog
        isOpen={!!caseToRename}
        onClose={() => setCaseToRename(null)}
        caseItem={caseToRename}
        onRename={handleRenameCase}
      />

      <DeleteConfirmDialog
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={handleDeleteCase}
        title="Delete this job check?"
        message="This will permanently remove the stored evidence and analysis for this case from this browser."
        confirmLabel="Delete Case"
      />
    </div>
  );
}
