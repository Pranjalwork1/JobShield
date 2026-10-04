"use client";

import React from "react";
import {
  Activity,
  FileCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  Clock,
} from "lucide-react";
import { DashboardRecentActivityItem } from "@/lib/dashboardMetrics";

interface RecentActivityProps {
  activities: DashboardRecentActivityItem[];
  onSelectCase: (caseId: string) => void;
}

export function RecentActivity({
  activities,
  onSelectCase,
}: RecentActivityProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "case_created":
        return <FolderOpen className="w-3.5 h-3.5 text-blue-600" />;
      case "evidence_added":
        return <FileCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case "analysis_completed":
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case "intelligence_generated":
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
      case "verification_target_completed":
      case "verification_completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Recent activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit timeline across your active investigations
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Audit trail
          </span>
        </div>

        {/* Timeline Events List */}
        <div className="py-3 space-y-3">
          {activities.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                No recorded activity yet
              </p>
              <p className="text-xs text-slate-400">
                Events will appear here as you intake evidence, run analysis, and complete verification.
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectCase(act.caseId)}
                className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-colors">
                  {getEventIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {act.company} <span className="text-slate-400 font-normal">• {act.role}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {act.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {act.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Tamper-evident local event log</span>
        <span>Automatic timestamping</span>
      </div>
    </div>
  );
}
