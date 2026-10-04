import assert from "node:assert/strict";
import { calculateDashboardMetrics } from "../lib/dashboardMetrics.ts";

console.log("==================================================");
console.log("  JOBSHIELD OPERATIONS DASHBOARD UNIT TESTS       ");
console.log("==================================================");

function makeFinding(id, severity, title) {
  return {
    id,
    ruleId: `RULE_${severity.toUpperCase()}`,
    severity,
    title,
    description: `Description for ${title}`,
    evidenceRefs: [],
    recommendedAction: "Verify finding",
  };
}

function makeCase(id, overrides = {}) {
  return {
    id,
    folderId: "folder_default",
    title: "Software Engineer",
    company: "Acme Corp",
    recruiterMessage: "",
    jobUrl: "",
    evidence: [],
    analysis: null,
    intelligence: null,
    timeline: [],
    status: "draft",
    completedVerificationTargets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAnalyzedAt: null,
    ...overrides,
  };
}

// TEST 1: Empty workspace metrics (Section 60)
console.log("\n[TEST 1] Testing Empty Workspace...");
{
  const metrics = calculateDashboardMetrics([]);
  assert.equal(metrics.activeChecks, 0);
  assert.equal(metrics.analyzedCases, 0);
  assert.equal(metrics.riskFindings, 0);
  assert.equal(metrics.openVerificationTargets, 0);
  assert.equal(metrics.totalVerificationTargets, 0);
  assert.equal(metrics.verificationCompletionRate, null);
  assert.equal(metrics.riskMix.total, 0);
  assert.equal(metrics.riskMix.high, 0);
  assert.equal(metrics.riskMix.medium, 0);
  assert.equal(metrics.riskMix.low, 0);
  assert.equal(metrics.recentCases.length, 0);
  assert.equal(metrics.nextActions.length, 0);
  console.log("  ✓ Empty workspace returns zeroed counts without fake numbers");
  console.log("  ✓ Completion rate is null (not falsely 100%)");
}

// TEST 2: Section 93 - Pie Chart Test & Case Deletion
console.log("\n[TEST 2] Testing Section 93 Risk Mix & Deletion Calculation...");
{
  const caseA = makeCase("case_a", {
    analysis: {},
    intelligence: {
      summary: { totalFindings: 2, highSeverityCount: 2, mediumSeverityCount: 0, lowSeverityCount: 0, contradictionCount: 0, missingCorroborationCount: 0 },
      findings: [
        makeFinding("f1", "high", "Payment Request"),
        makeFinding("f2", "high", "Financial Details"),
      ],
      contradictions: [],
      verificationTargets: [],
    },
  });

  const caseB = makeCase("case_b", {
    analysis: {},
    intelligence: {
      summary: { totalFindings: 3, highSeverityCount: 0, mediumSeverityCount: 3, lowSeverityCount: 0, contradictionCount: 0, missingCorroborationCount: 0 },
      findings: [
        makeFinding("f3", "medium", "Public Email"),
        makeFinding("f4", "medium", "Generic Domain"),
        makeFinding("f5", "medium", "Missing Salary"),
      ],
      contradictions: [],
      verificationTargets: [],
    },
  });

  const caseC = makeCase("case_c", {
    analysis: {},
    intelligence: {
      summary: { totalFindings: 5, highSeverityCount: 0, mediumSeverityCount: 0, lowSeverityCount: 5, contradictionCount: 0, missingCorroborationCount: 0 },
      findings: [
        makeFinding("f6", "low", "Low 1"),
        makeFinding("f7", "low", "Low 2"),
        makeFinding("f8", "low", "Low 3"),
        makeFinding("f9", "low", "Low 4"),
        makeFinding("f10", "low", "Low 5"),
      ],
      contradictions: [],
      verificationTargets: [],
    },
  });

  let metrics = calculateDashboardMetrics([caseA, caseB, caseC]);
  assert.equal(metrics.riskMix.high, 2, "High must be 2");
  assert.equal(metrics.riskMix.medium, 3, "Medium must be 3");
  assert.equal(metrics.riskMix.low, 5, "Low must be 5");
  assert.equal(metrics.riskMix.total, 10, "Total must be 10");
  assert.equal(metrics.riskFindings, 10);
  assert.equal(metrics.analyzedCases, 3);
  console.log("  ✓ High: 2, Medium: 3, Low: 5 -> Total: 10 findings in donut");

  // Delete Case B
  metrics = calculateDashboardMetrics([caseA, caseC]);
  assert.equal(metrics.riskMix.high, 2);
  assert.equal(metrics.riskMix.medium, 0);
  assert.equal(metrics.riskMix.low, 5);
  assert.equal(metrics.riskMix.total, 7);
  assert.equal(metrics.riskFindings, 7);
  assert.equal(metrics.analyzedCases, 2);
  console.log("  ✓ After deleting Case B: High: 2, Medium: 0, Low: 5 -> Total: 7 findings");
}

// TEST 3: Section 94 - Case Isolation Test
console.log("\n[TEST 3] Testing Section 94 Case Isolation...");
{
  const caseA = makeCase("case_a", {
    analysis: {},
    intelligence: {
      findings: [makeFinding("f1", "high", "High 1")],
      contradictions: [],
      verificationTargets: [],
    },
  });

  const caseB = makeCase("case_b", {
    analysis: {},
    intelligence: {
      findings: [
        makeFinding("f2", "low", "Low 1"),
        makeFinding("f3", "low", "Low 2"),
        makeFinding("f4", "low", "Low 3"),
      ],
      contradictions: [],
      verificationTargets: [],
    },
  });

  let metrics = calculateDashboardMetrics([caseA, caseB]);
  assert.equal(metrics.riskMix.high, 1);
  assert.equal(metrics.riskMix.low, 3);
  console.log("  ✓ Dashboard combines isolated cases: High: 1, Low: 3");

  // Delete Case A
  metrics = calculateDashboardMetrics([caseB]);
  assert.equal(metrics.riskMix.high, 0);
  assert.equal(metrics.riskMix.low, 3);
  console.log("  ✓ After deleting Case A: High: 0, Low: 3 (No stale data)");
}

// TEST 4: Section 16 & 17 - Verification Health & Completion Rate
console.log("\n[TEST 4] Testing Verification Health & Completion Rate...");
{
  const caseWithTargets = makeCase("case_targets", {
    analysis: {},
    completedVerificationTargets: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"],
    intelligence: {
      findings: [],
      contradictions: [],
      verificationTargets: [
        { id: "t1", title: "T1", reason: "Step 1", priority: "high", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t2", title: "T2", reason: "Step 2", priority: "high", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t3", title: "T3", reason: "Step 3", priority: "medium", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t4", title: "T4", reason: "Step 4", priority: "medium", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t5", title: "T5", reason: "Step 5", priority: "low", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t6", title: "T6", reason: "Step 6", priority: "low", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t7", title: "T7", reason: "Step 7", priority: "low", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t8", title: "T8", reason: "Step 8", priority: "low", status: "completed", sourceFindingIds: [], completedAt: null },
        { id: "t9", title: "T9", reason: "Step 9", priority: "high", status: "not_started", sourceFindingIds: [], completedAt: null },
        { id: "t10", title: "T10", reason: "Step 10", priority: "medium", status: "not_started", sourceFindingIds: [], completedAt: null },
      ],
    },
  });

  const metrics = calculateDashboardMetrics([caseWithTargets]);
  assert.equal(metrics.totalVerificationTargets, 10);
  assert.equal(metrics.completedVerificationTargets, 8);
  assert.equal(metrics.openVerificationTargets, 2);
  assert.equal(metrics.verificationCompletionRate, 80);
  console.log("  ✓ 8 completed / 10 total -> exactly 80% completion rate");
  console.log("  ✓ Open targets: 2");
}

// TEST 5: Section 34 - Recent Cases Sorting
console.log("\n[TEST 5] Testing Recent Cases Sorting...");
{
  const olderCase = makeCase("c_old", {
    title: "Senior Designer",
    company: "Meridian Labs",
    updatedAt: "2026-10-01T10:00:00Z",
  });
  const newerCase = makeCase("c_new", {
    title: "Platform Engineer",
    company: "Cobalt Systems",
    updatedAt: "2026-10-04T08:00:00Z",
  });

  const metrics = calculateDashboardMetrics([olderCase, newerCase]);
  assert.equal(metrics.recentCases[0].id, "c_new");
  assert.equal(metrics.recentCases[0].company, "Cobalt Systems");
  assert.equal(metrics.recentCases[1].id, "c_old");
  assert.equal(metrics.recentCases[1].company, "Meridian Labs");
  console.log("  ✓ Recent cases sorted by updatedAt descending");
}

// TEST 6: Section 26 - Next Actions Priority
console.log("\n[TEST 6] Testing Next Actions Sorting...");
{
  const caseActions = makeCase("c_act", {
    analysis: {},
    company: "Aster & Co.",
    title: "Sales Director",
    intelligence: {
      findings: [],
      contradictions: [
        { id: "c1", field: "salary", title: "Salary discrepancy", explanation: "₹8.5 LPA vs ₹12 LPA", values: [], severity: "high" }
      ],
      verificationTargets: [
        { id: "v_low", title: "Low target", reason: "Review website", priority: "low", status: "not_started", sourceFindingIds: [], completedAt: null },
        { id: "v_high", title: "High target", reason: "Verify registration fee", priority: "high", status: "not_started", sourceFindingIds: [], completedAt: null },
      ],
    },
  });

  const metrics = calculateDashboardMetrics([caseActions]);
  assert.equal(metrics.nextActions.length, 3);
  assert.equal(metrics.nextActions[0].priority, "High");
  assert.equal(metrics.nextActions[1].priority, "High");
  assert.equal(metrics.nextActions[2].priority, "Low");
  console.log("  ✓ High priority next actions sorted before Low priority");
}

console.log("\n==================================================");
console.log("✓ ALL DASHBOARD METRIC TESTS PASSED!");
console.log("==================================================");
