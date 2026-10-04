"use client";

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { RecentJobCheckItem } from "@/lib/dashboardMetrics";

interface RecentJobChecksProps {
  recentCases: RecentJobCheckItem[];
  onSelectCase: (caseId: string) => void;
  onViewAll?: () => void;
}

export function RecentJobChecks({
  recentCases,
  onSelectCase,
  onViewAll,
}: RecentJobChecksProps) {
  const getRiskBadge = (risk: RecentJobCheckItem["risk"], severity: RecentJobCheckItem["riskSeverity"]) => {
    switch (severity) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Low
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            No findings
          </span>
        );
    }
  };

  const getStatusBadge = (status: RecentJobCheckItem["status"]) => {
    switch (status) {
      case "Analyzed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● Analyzed
          </span>
        );
      case "Needs Verification":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            ● Needs Verification
          </span>
        );
      case "Analyzing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            ● Analyzing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            ● Draft
          </span>
        );
    }
  };

  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent job checks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Live status across your active verification queue
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            <span>All checks</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {recentCases.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No job checks yet</p>
          <p className="text-xs text-slate-400">
            Create a job check or load demo data to start populating your verification queue.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3">Role / Check</th>
                  <th className="py-3.5 px-3">Company</th>
                  <th className="py-3.5 px-3">Risk Findings</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Updated</th>
                  <th className="py-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCases.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item.id)}
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-3">
                      <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.role}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.displayId}
                      </div>
                    </td>

                    <td className="py-4 px-3 text-sm font-medium text-slate-700">
                      {item.company}
                    </td>

                    <td className="py-4 px-3">
                      {getRiskBadge(item.risk, item.riskSeverity)}
                    </td>

                    <td className="py-4 px-3">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-4 px-3 text-right text-xs text-slate-500 font-medium">
                      {item.updated}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100 pt-1">
            {recentCases.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCase(item.id)}
                className="py-4 space-y-2.5 active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {item.role}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {item.company}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.displayId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {getRiskBadge(item.risk, item.riskSeverity)}
                    {getStatusBadge(item.status)}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.updated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
