"use client";

import React from "react";
import { Evidence } from "@/types/jobshield";
import { EvidenceCard } from "./EvidenceCard";
import { Layers, Trash } from "lucide-react";

interface EvidenceListProps {
  evidenceList: Evidence[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export function EvidenceList({
  evidenceList,
  onRemove,
  onClearAll,
  disabled = false,
}: EvidenceListProps) {
  if (evidenceList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
        <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-700 font-semibold">
          No evidence items in case yet
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Add offer letters, screenshots, recruiter messages, or job URLs to begin building your case.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Evidence Case Items
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200">
            {evidenceList.length} / 7
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          disabled={disabled}
          className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-xs transition-colors disabled:opacity-40"
        >
          <Trash className="w-3.5 h-3.5" />
          Clear Case
        </button>
      </div>

      <div className="space-y-2">
        {evidenceList.map((item) => (
          <EvidenceCard
            key={item.id}
            evidence={item}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
