"use client";

import React from "react";
import { Calendar, Plus } from "lucide-react";
import { JobShieldIcon } from "@/components/brand/JobShieldLogo";
import { DashboardMetrics } from "@/lib/dashboardMetrics";
import { KpiCards } from "./KpiCards";
import { RecentJobChecks } from "./RecentJobChecks";
import { VerificationHealth } from "./VerificationHealth";
import { RiskMixChart } from "./RiskMixChart";
import { FolderOverview } from "./FolderOverview";
import { NextActions } from "./NextActions";
import { RecentActivity } from "./RecentActivity";
import { SystemStatus } from "./SystemStatus";
import { getGreetingDayLabel, getCurrentDateRangeLabel } from "@/lib/time";

interface OverviewDashboardProps {
  metrics: DashboardMetrics;
  folderName: string;
  onSelectCase: (caseId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onNewCase: () => void;
  onCreateFolder?: () => void;
  onNavigateSection: (section: string) => void;
  onFilterSeverity?: (severity: "high" | "medium" | "low") => void;
  onLoadDemo?: () => void;
}

export function OverviewDashboard({
  metrics,
  folderName,
  onSelectCase,
  onSelectFolder,
  onNewCase,
  onCreateFolder,
  onNavigateSection,
  onFilterSeverity,
  onLoadDemo,
}: OverviewDashboardProps) {
  const { dayLabel, greeting } = getGreetingDayLabel();
  const dateRangeLabel = getCurrentDateRangeLabel();

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* 1. Top Greeting / Overview Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-7 rounded-[26px] bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600">
              {dayLabel}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {greeting}, Investigator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
            {metrics.dynamicHeadline}{" "}
            <span className="text-slate-400 font-normal">
              {metrics.dynamicSubtitle}
            </span>
          </p>
        </div>

        {/* Right date / workspace badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-right">
            <div className="text-xs font-bold text-slate-800">
              {folderName}
            </div>
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 justify-end mt-0.5">
              <Calendar className="w-3 h-3 text-indigo-500" />
              <span>{dateRangeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards */}
      <KpiCards
        metrics={metrics}
        onNavigateSection={onNavigateSection}
      />

      {/* 3. Recent Job Checks (Full Width) */}
      <RecentJobChecks
        recentCases={metrics.recentCases}
        onSelectCase={onSelectCase}
        onViewAll={() => onNavigateSection("intake")}
      />

      {/* 4. Verification Health (2/3) + Risk Mix Donut Chart (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <VerificationHealth
            metrics={metrics}
            onOpenVerificationQueue={() => onNavigateSection("verification")}
          />
        </div>
        <div className="lg:col-span-5">
          <RiskMixChart
            riskMix={metrics.riskMix}
            activeChecksCount={metrics.activeChecks}
            onFilterSeverity={(severity) => {
              if (onFilterSeverity) {
                onFilterSeverity(severity);
              }
              onNavigateSection("dossier");
            }}
          />
        </div>
      </div>

      {/* 5. Folders (1/2) + Next Actions (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <div>
          <FolderOverview
            folderSummaries={metrics.folderSummaries}
            totalCases={metrics.activeChecks}
            onSelectFolder={(id) => {
              onSelectFolder(id);
              onNavigateSection("intake");
            }}
            onCreateFolder={onCreateFolder}
          />
        </div>
        <div>
          <NextActions
            actions={metrics.nextActions}
            onSelectCase={onSelectCase}
            onOpenQueue={() => onNavigateSection("verification")}
          />
        </div>
      </div>

      {/* 6. Recent Activity (2/3) + Operational Status (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <RecentActivity
            activities={metrics.recentActivity}
            onSelectCase={onSelectCase}
          />
        </div>
        <div className="lg:col-span-5">
          <SystemStatus
            onViewAuditLog={() => onNavigateSection("dossier")}
          />
        </div>
      </div>

      {/* Empty State Banner if no cases exist */}
      {metrics.activeChecks === 0 && (
        <div className="p-8 rounded-[24px] bg-[#EAF4FF] border border-[#B9DCFE] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1E90FF] text-white flex items-center justify-center mx-auto shadow-md shadow-[#1E90FF]/25">
            <JobShieldIcon size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">
              Your JobShield workspace is ready
            </h3>
            <p className="text-xs text-[#667085] max-w-md mx-auto">
              Start by creating a new job check to upload offer letters and recruiter messages, or load the pre-configured demo verification check.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="px-4 py-2 rounded-xl border border-[#B9DCFE] text-xs font-semibold text-[#1877D2] bg-white hover:bg-[#F4F9FF] transition-all cursor-pointer shadow-2xs"
              >
                Load Demo Case
              </button>
            )}
            <button
              type="button"
              onClick={onNewCase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E90FF] text-white text-xs font-bold hover:bg-[#1877D2] active:bg-[#1565C0] shadow-md shadow-[#1E90FF]/25 border-none transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Job Check</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
