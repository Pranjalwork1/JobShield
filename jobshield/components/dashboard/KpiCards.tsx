"use client";

import React from "react";
import { Layers, CheckCircle2, ShieldAlert, ListChecks } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { DashboardMetrics } from "@/lib/dashboardMetrics";

interface KpiCardsProps {
  metrics: DashboardMetrics;
  onNavigateSection?: (section: string) => void;
}

export function KpiCards({ metrics, onNavigateSection }: KpiCardsProps) {
  const analyzedPercent =
    metrics.activeChecks > 0
      ? Math.round((metrics.analyzedCases / metrics.activeChecks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Active checks */}
      <KpiCard
        title="Active checks"
        value={metrics.activeChecks}
        subtitle={
          metrics.activeChecks === 0
            ? "No cases in workspace"
            : `${metrics.activeChecks} total active case${metrics.activeChecks > 1 ? "s" : ""}`
        }
        badge="Current total"
        icon={Layers}
        variant="indigo"
        onClick={() => onNavigateSection?.("intake")}
      />

      {/* 2. Analyzed cases */}
      <KpiCard
        title="Analyzed cases"
        value={metrics.analyzedCases}
        subtitle={
          metrics.activeChecks === 0
            ? "0% completion"
            : `${analyzedPercent}% completed`
        }
        badge={metrics.analyzedCases > 0 ? "Gemini verified" : "Pending"}
        icon={CheckCircle2}
        variant="emerald"
        onClick={() => onNavigateSection?.("dossier")}
      />

      {/* 3. Risk findings */}
      <KpiCard
        title="Risk findings"
        value={metrics.riskFindings}
        subtitle={
          metrics.riskFindings === 0
            ? "No findings observed"
            : `${metrics.riskMix.high} high priority`
        }
        badge={metrics.riskMix.high > 0 ? "Review needed" : "Evidence backed"}
        icon={ShieldAlert}
        variant="rose"
        onClick={() => onNavigateSection?.("dossier")}
      />

      {/* 4. Open verification targets */}
      <KpiCard
        title="Open verification targets"
        value={metrics.openVerificationTargets}
        subtitle={
          metrics.totalVerificationTargets === 0
            ? "No targets generated"
            : `${metrics.completedVerificationTargets} of ${metrics.totalVerificationTargets} completed`
        }
        badge={
          metrics.openVerificationTargets > 0
            ? `${metrics.openVerificationTargets} open`
            : "All clear"
        }
        icon={ListChecks}
        variant="amber"
        onClick={() => onNavigateSection?.("verification")}
      />
    </div>
  );
}
