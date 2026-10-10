import { JobShieldCase, JobShieldFolder } from "@/types/jobshield";
import { formatRelativeTime, formatAppliedDate } from "@/lib/time";

export interface RiskMixData {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface RecentJobCheckItem {
  id: string;
  displayId: string;
  role: string;
  company: string;
  risk: "High" | "Medium" | "Low" | "No findings" | "Pending";
  riskSeverity: "high" | "medium" | "low" | "none" | "pending";
  status: "Draft" | "Analyzing" | "Analyzed" | "Needs Verification";
  rawStatus: string;
  updated: string;
  updatedAt: string;
  appliedDate?: string;
  highFindingsCount?: number;
  mediumFindingsCount?: number;
  lowFindingsCount?: number;
  totalFindingsCount?: number;
}

export interface DashboardNextAction {
  id: string;
  caseId: string;
  title: string;
  company: string;
  role: string;
  priority: "High" | "Medium" | "Low";
}

export interface DashboardRecentActivityItem {
  id: string;
  caseId: string;
  company: string;
  role: string;
  type: string;
  message: string;
  timestamp: string;
  timeAgo: string;
}

export interface FolderSummaryItem {
  id: string;
  name: string;
  caseCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface DashboardMetrics {
  activeChecks: number;
  analyzedCases: number;
  riskFindings: number;
  openVerificationTargets: number;
  completedVerificationTargets: number;
  totalVerificationTargets: number;
  verificationCompletionRate: number | null;
  riskMix: RiskMixData;
  recentCases: RecentJobCheckItem[];
  nextActions: DashboardNextAction[];
  recentActivity: DashboardRecentActivityItem[];
  folderSummaries: FolderSummaryItem[];
  dynamicHeadline: string;
  dynamicSubtitle: string;
}

export const RISK_CHART_COLORS = {
  high: "#EF4444",   // Red
  medium: "#F59E0B", // Amber
  low: "#3B82F6",    // Professional Blue
} as const;

/**
 * Calculates deterministic dashboard metrics from active JobShield cases.
 * Strictly operates on local stored cases without mocking or synthetic metrics.
 */
export function calculateDashboardMetrics(
  cases: JobShieldCase[],
  folders: JobShieldFolder[] = []
): DashboardMetrics {
  const activeCases = cases;
  const activeChecks = activeCases.length;

  let analyzedCount = 0;
  let totalFindingsCount = 0;
  let openTargetsCount = 0;
  let completedTargetsCount = 0;
  let totalTargetsCount = 0;

  let highFindings = 0;
  let mediumFindings = 0;
  let lowFindings = 0;

  const allNextActions: DashboardNextAction[] = [];
  const allTimelineEvents: DashboardRecentActivityItem[] = [];

  // Folder metrics accumulator
  const folderStatsMap = new Map<
    string,
    { count: number; high: number; medium: number; low: number }
  >();

  // Initialize folders
  folders.forEach((f) => {
    folderStatsMap.set(f.id, { count: 0, high: 0, medium: 0, low: 0 });
  });

  for (const c of activeCases) {
    const isAnalyzed = c.analysis !== null;
    if (isAnalyzed) {
      analyzedCount++;
    }

    const companyName = c.company?.trim() || "Unspecified Company";
    const roleName = c.title?.trim() || "Job Check";

    // Track folder stats
    const folderStat = folderStatsMap.get(c.folderId);
    if (folderStat) {
      folderStat.count++;
    }

    // P3 findings calculation
    const findings = c.intelligence?.findings || [];
    for (const f of findings) {
      totalFindingsCount++;
      if (f.severity === "high") {
        highFindings++;
        if (folderStat) folderStat.high++;
      } else if (f.severity === "medium") {
        mediumFindings++;
        if (folderStat) folderStat.medium++;
      } else if (f.severity === "low") {
        lowFindings++;
        if (folderStat) folderStat.low++;
      }
    }

    // Verification targets calculation
    const verificationTargets = c.intelligence?.verificationTargets || [];
    const completedSet = new Set(c.completedVerificationTargets || []);

    for (const vt of verificationTargets) {
      totalTargetsCount++;
      const isCompleted = vt.status === "completed" || completedSet.has(vt.id);
      if (isCompleted) {
        completedTargetsCount++;
      } else {
        openTargetsCount++;
        // Generate a next action for open verification target
        allNextActions.push({
          id: `vt_${vt.id}`,
          caseId: c.id,
          title: vt.title || vt.reason || "Verify recruitment evidence",
          company: companyName,
          role: roleName,
          priority: vt.priority === "high" ? "High" : vt.priority === "medium" ? "Medium" : "Low",
        });
      }
    }

    // High severity findings next actions if not already captured
    if (c.intelligence?.contradictions && c.intelligence.contradictions.length > 0) {
      for (const contra of c.intelligence.contradictions) {
        allNextActions.push({
          id: `contra_${contra.id}`,
          caseId: c.id,
          title: `Review conflicting ${contra.field.replace(/_/g, " ")}: ${contra.title || contra.explanation}`,
          company: companyName,
          role: roleName,
          priority: "High",
        });
      }
    }

    // Timeline events
    if (c.timeline && c.timeline.length > 0) {
      for (const ev of c.timeline) {
        allTimelineEvents.push({
          id: ev.id,
          caseId: c.id,
          company: companyName,
          role: roleName,
          type: ev.type,
          message: ev.description,
          timestamp: ev.timestamp,
          timeAgo: formatRelativeTime(ev.timestamp),
        });
      }
    }
  }

  // Verification Completion Rate
  const verificationCompletionRate =
    totalTargetsCount > 0
      ? Math.round((completedTargetsCount / totalTargetsCount) * 100)
      : null;

  // Risk Mix
  const riskMix: RiskMixData = {
    high: highFindings,
    medium: mediumFindings,
    low: lowFindings,
    total: highFindings + mediumFindings + lowFindings,
  };

  // Recent Cases (sort by updatedAt descending, limit 5)
  const sortedCases = [...activeCases].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const recentCases: RecentJobCheckItem[] = sortedCases.slice(0, 5).map((c) => {
    // Determine risk summary from P3 findings
    let risk: RecentJobCheckItem["risk"] = "No findings";
    let riskSeverity: RecentJobCheckItem["riskSeverity"] = "none";

    let caseHighCount = 0;
    let caseMediumCount = 0;
    let caseLowCount = 0;
    const caseTotalFindings = c.intelligence?.findings?.length || 0;

    if (!c.analysis) {
      risk = "Pending";
      riskSeverity = "pending";
    } else {
      const findings = c.intelligence?.findings || [];
      findings.forEach((f) => {
        if (f.severity === "high") caseHighCount++;
        else if (f.severity === "medium") caseMediumCount++;
        else if (f.severity === "low") caseLowCount++;
      });

      if (caseHighCount > 0) {
        risk = "High";
        riskSeverity = "high";
      } else if (caseMediumCount > 0) {
        risk = "Medium";
        riskSeverity = "medium";
      } else if (caseLowCount > 0) {
        risk = "Low";
        riskSeverity = "low";
      } else {
        risk = "No findings";
        riskSeverity = "none";
      }
    }

    // Map status
    let status: RecentJobCheckItem["status"] = "Draft";
    if (c.status === "analyzing") status = "Analyzing";
    else if (c.status === "analyzed") status = "Analyzed";
    else if (c.status === "needs_verification") status = "Needs Verification";
    else status = "Draft";

    const displayId = `JS-${c.id.slice(-4).toUpperCase()}`;

    return {
      id: c.id,
      displayId,
      role: c.title?.trim() || "Untitled Job Check",
      company: c.company?.trim() || "Unspecified Company",
      risk,
      riskSeverity,
      status,
      rawStatus: c.status,
      updated: formatRelativeTime(c.updatedAt),
      updatedAt: c.updatedAt,
      appliedDate: formatAppliedDate(c.createdAt || c.updatedAt),
      highFindingsCount: caseHighCount,
      mediumFindingsCount: caseMediumCount,
      lowFindingsCount: caseLowCount,
      totalFindingsCount: caseTotalFindings,
    };
  });

  // Prioritize Next Actions (High > Medium > Low, limit 5)
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const sortedNextActions = allNextActions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);

  // Recent Activity (sort by timestamp descending, limit 6)
  const sortedRecentActivity = allTimelineEvents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  // Folder summaries
  const folderSummaries: FolderSummaryItem[] = folders.map((f) => {
    const stats = folderStatsMap.get(f.id) || { count: 0, high: 0, medium: 0, low: 0 };
    return {
      id: f.id,
      name: f.name,
      caseCount: stats.count,
      highCount: stats.high,
      mediumCount: stats.medium,
      lowCount: stats.low,
    };
  });

  // Dynamic greeting sentence based on actual state
  let dynamicSubtitle = "Your JobShield verification workspace is ready.";
  let dynamicHeadline = "Your workspace is clear — no open verification items.";

  if (activeChecks === 0) {
    dynamicHeadline = "Welcome to JobShield";
    dynamicSubtitle = "Start your first job check to intake recruitment evidence and run verification.";
  } else if (openTargetsCount > 0 && highFindings > 0) {
    dynamicHeadline = `${openTargetsCount} verification target${openTargetsCount > 1 ? "s" : ""} need attention.`;
    dynamicSubtitle = `${highFindings} high priority finding${highFindings > 1 ? "s" : ""} detected across your active checks.`;
  } else if (openTargetsCount > 0) {
    dynamicHeadline = `${openTargetsCount} check${openTargetsCount > 1 ? "s" : ""} need attention before hiring review.`;
    dynamicSubtitle = "Open verification targets are awaiting corroboration.";
  } else if (highFindings > 0) {
    dynamicHeadline = `${highFindings} high priority finding${highFindings > 1 ? "s" : ""} require review.`;
    dynamicSubtitle = "Evidence analysis flagged items requiring manual validation.";
  } else if (analyzedCount > 0) {
    dynamicHeadline = "All active checks have been evaluated.";
    dynamicSubtitle = "No open verification targets remaining in this workspace.";
  }

  return {
    activeChecks,
    analyzedCases: analyzedCount,
    riskFindings: totalFindingsCount,
    openVerificationTargets: openTargetsCount,
    completedVerificationTargets: completedTargetsCount,
    totalVerificationTargets: totalTargetsCount,
    verificationCompletionRate,
    riskMix,
    recentCases,
    nextActions: sortedNextActions,
    recentActivity: sortedRecentActivity,
    folderSummaries,
    dynamicHeadline,
    dynamicSubtitle,
  };
}
