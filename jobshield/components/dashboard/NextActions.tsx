"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { DashboardNextAction } from "@/lib/dashboardMetrics";

interface NextActionsProps {
  actions: DashboardNextAction[];
  onSelectCase: (caseId: string) => void;
  onOpenQueue?: () => void;
}

export function NextActions({
  actions,
  onSelectCase,
  onOpenQueue,
}: NextActionsProps) {
  const getPriorityBadge = (priority: DashboardNextAction["priority"]) => {
    switch (priority) {
      case "High":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            HIGH
          </span>
        );
      case "Medium":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Next actions
            </h3>
            {actions.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {actions.length} open
              </span>
            )}
          </div>

          {onOpenQueue && (
            <button
              type="button"
              onClick={onOpenQueue}
              className="text-xs font-semibold text-[#1E90FF] hover:text-[#1877D2] transition-colors cursor-pointer"
            >
              Open queue
            </button>
          )}
        </div>

        {/* Actions List */}
        <div className="py-3 space-y-2.5">
          {actions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                All actions completed
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No open verification tasks or unresolved contradictions in this workspace.
              </p>
            </div>
          ) : (
            actions.map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectCase(act.caseId)}
                className="group flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/60 hover:bg-[#F4F9FF] border border-slate-100 hover:border-[#B9DCFE] transition-all cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(act.priority)}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#1877D2] transition-colors">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-medium">
                    {act.company} <span className="text-slate-300">•</span> {act.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(act.caseId);
                  }}
                  className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:bg-[#1E90FF] group-hover:text-white group-hover:border-[#1E90FF] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Open case"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Prioritized by finding severity</span>
        <span>Empirical tasks</span>
      </div>
    </div>
  );
}
