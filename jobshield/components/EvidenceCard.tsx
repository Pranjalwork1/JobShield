"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Globe,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Evidence } from "@/types/jobshield";

interface EvidenceCardProps {
  evidence: Evidence;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function EvidenceCard({
  evidence,
  onRemove,
  disabled = false,
}: EvidenceCardProps) {
  const getIcon = () => {
    switch (evidence.type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-400" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case "text":
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case "url":
        return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSubtitle = () => {
    if (evidence.type === "pdf" || evidence.type === "image") {
      const sizeStr = formatSize(evidence.size);
      const mime = evidence.mimeType ? evidence.mimeType.split("/")[1]?.toUpperCase() : "";
      return [mime, sizeStr].filter(Boolean).join(" • ");
    }
    if (evidence.type === "text") {
      return `${evidence.text?.length || 0} characters`;
    }
    if (evidence.type === "url") {
      return "Job Link Reference";
    }
    return "";
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-white/95 border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 group">
      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {evidence.name}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Valid
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(evidence.id)}
        disabled={disabled}
        aria-label={`Remove ${evidence.name}`}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
