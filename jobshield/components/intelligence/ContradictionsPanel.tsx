"use client";

import React from "react";
import { Contradiction } from "@/lib/intelligence/types";
import { ContradictionCard } from "./ContradictionCard";
import { GitCompare } from "lucide-react";

interface ContradictionsPanelProps {
  contradictions: Contradiction[];
}

export function ContradictionsPanel({ contradictions }: ContradictionsPanelProps) {
  if (contradictions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-label="Document Contradictions">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-amber-600" />
            <span>Document Inconsistencies & Contradictions ({contradictions.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Factual conflicts identified between separate pieces of evidence in this case.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {contradictions.map((c) => (
          <ContradictionCard key={c.id} contradiction={c} />
        ))}
      </div>
    </section>
  );
}
