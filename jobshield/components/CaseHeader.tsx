"use client";

import React from "react";
import {
  Building2,
  FolderSymlink,
  Edit2,
  Trash2,
  Folder,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  CheckSquare,
} from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";
import { getCaseDisplayTitle } from "@/lib/caseStore";
import { EvidenceSummary } from "./EvidenceSummary";

interface CaseHeaderProps {
  currentCase: JobShieldCase;
  folderName: string;
  onMove: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function CaseHeader({
  currentCase,
  folderName,
  onMove,
  onRename,
  onDelete,
}: CaseHeaderProps) {
  const { title, company } = getCaseDisplayTitle(currentCase);

  const getStatusBadge = () => {
    switch (currentCase.status) {
      case "analyzing":
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Analyzing
          </span>
        );
      case "needs_verification":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Verification
          </span>
        );
      case "analyzed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Analyzed
          </span>
        );
      case "draft":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
            Draft Case
          </span>
        );
    }
  };

  const formatAnalyzed = (isoString?: string | null) => {
    if (!isoString) return "Not analyzed yet";
    try {
      const d = new Date(isoString);
      return `Last analyzed: ${d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })}, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "Not analyzed yet";
    }
  };

  return (
    <div className="bg-white/95 rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Title & Metadata matching "Overview" in ui final.webp */}
      <div className="space-y-2.5 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge()}

          <button
            type="button"
            onClick={onMove}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-500" />
            <span>Folder: {folderName}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            title="Copy case link"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <FolderSymlink className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 truncate">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{company}</span>
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
          <EvidenceSummary currentCase={currentCase} showDetails={true} size="sm" />
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatAnalyzed(currentCase.lastAnalyzedAt)}</span>
          </span>

          {currentCase.intelligence && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] border border-slate-200">
                <ShieldAlert className="w-3 h-3 text-indigo-600" />
                <span>{currentCase.intelligence.summary.totalFindings} intelligence findings</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] border border-slate-200">
                <CheckSquare className="w-3 h-3 text-emerald-600" />
                <span>{currentCase.intelligence.summary.verificationTargetCount} verification targets</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onMove}
          title="Move to another folder"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95 cursor-pointer"
        >
          <FolderSymlink className="w-3.5 h-3.5 text-indigo-500" />
          <span>Move</span>
        </button>

        <button
          type="button"
          onClick={onRename}
          title="Rename case"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Rename</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Delete case"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-transparent hover:border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
