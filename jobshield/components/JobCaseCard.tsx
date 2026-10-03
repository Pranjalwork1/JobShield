"use client";

import React, { useState } from "react";
import {
  FileText,
  MoreVertical,
  FolderSymlink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";
import { getCaseDisplayTitle } from "@/lib/caseStore";
import { getCaseEvidenceBreakdown } from "./EvidenceSummary";

interface JobCaseCardProps {
  caseItem: JobShieldCase;
  folderName: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (caseItem: JobShieldCase) => void;
  onRename: (caseItem: JobShieldCase) => void;
  onDelete: (caseItem: JobShieldCase) => void;
}

export function JobCaseCard({
  caseItem,
  folderName,
  isSelected,
  onSelect,
  onMove,
  onRename,
  onDelete,
}: JobCaseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { title, company } = getCaseDisplayTitle(caseItem);
  const breakdown = getCaseEvidenceBreakdown(caseItem);

  const getStatusBadge = () => {
    switch (caseItem.status) {
      case "analyzing":
        return (
          <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Analyzing
          </span>
        );
      case "needs_verification":
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            Needs Verification
          </span>
        );
      case "analyzed":
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Analyzed
          </span>
        );
      case "draft":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
            Draft
          </span>
        );
    }
  };

  const riskCount = caseItem.analysis?.risk_indicators?.length ?? 0;
  const highRiskCount =
    caseItem.analysis?.risk_indicators?.filter((r) => r.severity === "high").length ?? 0;

  // Format timestamp
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative group">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(caseItem.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(caseItem.id);
          }
        }}
        className={`w-full p-4 rounded-[28px] border text-left transition-all duration-200 cursor-pointer select-none space-y-3 ${
          isSelected
            ? "bg-white border-2 border-indigo-400/95 shadow-md shadow-indigo-100/60 ring-2 ring-indigo-500/10"
            : "bg-white border-slate-200/85 hover:border-slate-300 hover:shadow-2xs"
        }`}
      >
        {/* Top Header: Title & Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="text-base font-extrabold text-slate-900 truncate">
              {title}
            </h4>
            <p className="text-xs font-semibold text-slate-500 truncate">
              {company}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Evidence Breakdown (matching screenshot) */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <FileText className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
            <span>{breakdown.label}</span>
          </div>
          {breakdown.details.length > 0 && (
            <p className="text-[11px] text-slate-400 font-medium">
              ( {breakdown.filesCount > 0 && `${breakdown.filesCount} file${breakdown.filesCount === 1 ? "" : "s"}`}
              {breakdown.hasMessage && ` • 💬 1 message`}
              {breakdown.hasUrl && ` • 🌐 1 URL`} )
            </p>
          )}
        </div>

        {/* Intelligence / Findings Badge (Requirements 53, 54) */}
        {caseItem.intelligence ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                caseItem.intelligence.summary.highSeverityCount > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : caseItem.intelligence.summary.totalFindings > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span>
                {caseItem.intelligence.summary.totalFindings} finding{caseItem.intelligence.summary.totalFindings === 1 ? "" : "s"}
              </span>
            </span>

            {caseItem.intelligence.summary.contradictionCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {caseItem.intelligence.summary.contradictionCount} conflict{caseItem.intelligence.summary.contradictionCount === 1 ? "" : "s"}
              </span>
            )}

            {caseItem.intelligence.summary.verificationTargetCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {caseItem.intelligence.summary.verificationTargetCount} to verify
              </span>
            )}
          </div>
        ) : caseItem.analysis && riskCount > 0 ? (
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                highRiskCount > 0
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {riskCount} risk indicator{riskCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}

        {/* Bottom Row: Status, Folder & Timestamp */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1 font-medium truncate max-w-[90px]">
              <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{folderName}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium shrink-0">
              {formatTime(caseItem.lastAnalyzedAt || caseItem.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-3 top-10 w-36 py-1 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 animate-in fade-in duration-100 text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onSelect(caseItem.id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Open Case</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onRename(caseItem);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onMove(caseItem);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
            >
              <FolderSymlink className="w-3.5 h-3.5 text-slate-400" />
              <span>Move</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(caseItem);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left font-medium border-t border-slate-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
