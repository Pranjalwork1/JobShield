"use client";

import React from "react";
import { IntelligenceVerificationTarget } from "@/lib/intelligence/types";
import { VerificationItem } from "./VerificationItem";
import { CheckSquare, Info } from "lucide-react";

interface VerificationQueueProps {
  targets: IntelligenceVerificationTarget[];
  completedTargets: string[];
  onToggleTarget: (targetTitle: string) => void;
}

export function VerificationQueue({
  targets,
  completedTargets,
  onToggleTarget,
}: VerificationQueueProps) {
  if (targets.length === 0) return null;

  const completedCount = targets.filter((t) =>
    completedTargets.includes(t.title)
  ).length;

  return (
    <section className="space-y-4" aria-label="Verification Queue">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Verify Before Proceeding ({targets.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Action items you should independently clarify before sending money, identity proofs, or signing.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
          <span>
            {completedCount} of {targets.length} completed
          </span>
          <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((completedCount / targets.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Target Items List */}
      <div className="space-y-2.5">
        {targets.map((t) => (
          <VerificationItem
            key={t.id}
            target={t}
            isCompleted={completedTargets.includes(t.title)}
            onToggle={onToggleTarget}
          />
        ))}
      </div>

      {/* Verification Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          JobShield does not perform live external verification. Checking an item records your personal confirmation.
        </span>
      </div>
    </section>
  );
}
