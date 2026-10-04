"use client";

import React from "react";
import { ListTodo, Activity } from "lucide-react";
import { DashboardMetrics } from "@/lib/dashboardMetrics";

interface VerificationHealthProps {
  metrics: DashboardMetrics;
  onOpenVerificationQueue?: () => void;
}

export function VerificationHealth({
  metrics,
  onOpenVerificationQueue,
}: VerificationHealthProps) {
  const hasTargets = metrics.totalVerificationTargets > 0;
  const rate = metrics.verificationCompletionRate;

  return (
    <div className="rounded-[24px] bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Verification health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progress across generated verification targets
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              metrics.openVerificationTargets === 0 && hasTargets
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                metrics.openVerificationTargets === 0 && hasTargets
                  ? "bg-emerald-500"
                  : "bg-blue-500 animate-pulse"
              }`}
            />
            {metrics.openVerificationTargets === 0 && hasTargets
              ? "All Completed"
              : "Active"}
          </span>
        </div>

        {/* Big Ring / Badge + Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 py-6 items-center">
          {/* Left: Completion Circle Indicator */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            {hasTargets && rate !== null ? (
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG circular progress ring */}
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={rate >= 80 ? "#10B981" : rate >= 40 ? "#3B82F6" : "#F59E0B"}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * rate) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {rate}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Resolved
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-2">
                <ListTodo className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                  No targets yet
                </span>
              </div>
            )}

            <span className="text-xs font-semibold text-slate-600 mt-2 text-center">
              {hasTargets
                ? `${metrics.completedVerificationTargets} of ${metrics.totalVerificationTargets} completed`
                : "Analyze a case to generate targets"}
            </span>
          </div>

          {/* Right: Metrics list */}
          <div className="sm:col-span-7 space-y-3.5 pl-0 sm:pl-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Completed targets</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {metrics.completedVerificationTargets}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Open verification targets</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {metrics.openVerificationTargets}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total generated targets</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {metrics.totalVerificationTargets}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Completion rate</span>
              <span className="font-bold text-indigo-600 font-mono text-sm">
                {rate !== null ? `${rate}%` : "No targets yet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pill */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium">JobShield Verify v4.2</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">Deterministic P3</span>
        </div>

        {onOpenVerificationQueue && (
          <button
            type="button"
            onClick={onOpenVerificationQueue}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Open queue →
          </button>
        )}
      </div>
    </div>
  );
}
