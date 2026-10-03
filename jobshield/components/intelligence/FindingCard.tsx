"use client";

import React from "react";
import { IntelligenceFinding } from "@/lib/intelligence/types";
import {
  AlertTriangle,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  ShieldAlert,
  Info,
} from "lucide-react";

interface FindingCardProps {
  finding: IntelligenceFinding;
}

export function FindingCard({ finding }: FindingCardProps) {
  const getSeverityBadge = () => {
    switch (finding.severity) {
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black tracking-wide uppercase flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Medium Priority
          </span>
        );
      case "low":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <Info className="w-3 h-3 text-blue-500" />
            Informational
          </span>
        );
    }
  };

  const renderEvidenceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileCode className="w-3.5 h-3.5 text-rose-500" />;
      case "image":
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case "url":
        return <LinkIcon className="w-3.5 h-3.5 text-blue-500" />;
      case "text":
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <article
      className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all space-y-4"
      aria-labelledby={`finding-title-${finding.id}`}
    >
      {/* Top Header: Badge, Title & Type */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            {getSeverityBadge()}
            <span className="text-[11px] font-semibold text-slate-400 capitalize px-2 py-0.5 rounded-full bg-slate-100">
              {finding.type.replace(/_/g, " ")}
            </span>
          </div>
          <h4
            id={`finding-title-${finding.id}`}
            className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight pt-1"
          >
            {finding.title}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {finding.summary}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] font-mono text-slate-400 font-medium">
            Confidence: {finding.confidence}
          </span>
        </div>
      </div>

      {/* Observed vs Why It Matters Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* OBSERVED */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Observed in Evidence</span>
          </div>
          <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
            &ldquo;{finding.observedEvidence}&rdquo;
          </p>
        </div>

        {/* WHY IT MATTERS */}
        <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Why This Matters</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {finding.whyItMatters}
          </p>
        </div>
      </div>

      {/* Evidence References Trail */}
      {finding.evidence && finding.evidence.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">
            Source Evidence:
          </span>
          {finding.evidence.map((ev, idx) => (
            <div
              key={`${ev.evidenceId}_${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
              title={ev.description}
            >
              {renderEvidenceIcon(ev.evidenceType)}
              <span className="truncate max-w-[200px]">{ev.evidenceName}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
