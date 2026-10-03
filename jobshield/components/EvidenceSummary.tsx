import React from "react";
import { FileText, MessageSquare, Globe } from "lucide-react";
import { JobShieldCase } from "@/types/jobshield";

export interface CaseEvidenceBreakdown {
  total: number;
  filesCount: number;
  hasMessage: boolean;
  hasUrl: boolean;
  label: string;
  details: string[];
}

export function getCaseEvidenceBreakdown(
  c: JobShieldCase | null | undefined
): CaseEvidenceBreakdown {
  if (!c) {
    return {
      total: 0,
      filesCount: 0,
      hasMessage: false,
      hasUrl: false,
      label: "0 evidence items",
      details: [],
    };
  }

  const filesCount = c.evidence?.length ?? 0;
  const hasMessage = Boolean(c.recruiterMessage?.trim());
  const hasUrl = Boolean(c.jobUrl?.trim());

  const total = filesCount + (hasMessage ? 1 : 0) + (hasUrl ? 1 : 0);

  const details: string[] = [];
  if (filesCount > 0) {
    details.push(`${filesCount} file${filesCount === 1 ? "" : "s"}`);
  }
  if (hasMessage) {
    details.push("1 recruiter message");
  }
  if (hasUrl) {
    details.push("1 job URL");
  }

  const label = `${total} evidence item${total === 1 ? "" : "s"}`;

  return {
    total,
    filesCount,
    hasMessage,
    hasUrl,
    label,
    details,
  };
}

interface EvidenceSummaryProps {
  currentCase: JobShieldCase | null | undefined;
  showDetails?: boolean;
  size?: "sm" | "md";
}

export function EvidenceSummary({
  currentCase,
  showDetails = false,
  size = "sm",
}: EvidenceSummaryProps) {
  const breakdown = getCaseEvidenceBreakdown(currentCase);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
      <span
        className={`flex items-center gap-1 font-semibold ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>{breakdown.label}</span>
      </span>

      {showDetails && breakdown.details.length > 0 && (
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-1">
          (
          {breakdown.filesCount > 0 && (
            <span className="flex items-center gap-0.5">
              <span>{breakdown.filesCount} file{breakdown.filesCount === 1 ? "" : "s"}</span>
            </span>
          )}
          {breakdown.hasMessage && (
            <>
              {breakdown.filesCount > 0 && <span>•</span>}
              <span className="flex items-center gap-0.5">
                <MessageSquare className="w-2.5 h-2.5 text-slate-400" />
                <span>1 message</span>
              </span>
            </>
          )}
          {breakdown.hasUrl && (
            <>
              {(breakdown.filesCount > 0 || breakdown.hasMessage) && <span>•</span>}
              <span className="flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5 text-slate-400" />
                <span>1 URL</span>
              </span>
            </>
          )}
          )
        </span>
      )}
    </div>
  );
}
