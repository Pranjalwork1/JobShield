import { JobShieldCase } from "@/types/jobshield";
import { JobShieldAnalysis } from "@/lib/schemas";
import { JobShieldIntelligence } from "./types";
import { buildNormalizedFacts } from "./normalize";
import { indexCaseEvidence } from "./evidence";
import { evaluateRules, deduplicateFindings } from "./rules";
import { detectContradictions } from "./contradictions";
import { generateVerificationTargets } from "./verification";

/**
 * Central P3 Intelligence Engine pipeline function.
 * Deterministically derives structured intelligence, contradictions,
 * traceable evidence references, and verification targets from validated P2 facts.
 */
export function analyzeJobShieldIntelligence(
  caseData: Pick<
    JobShieldCase,
    "id" | "title" | "company" | "recruiterMessage" | "jobUrl" | "evidence"
  >,
  p2Analysis: JobShieldAnalysis
): JobShieldIntelligence {
  const generatedAt = new Date().toISOString();

  // 1. Normalize facts
  const normalizedFacts = buildNormalizedFacts(
    {
      title: caseData.title,
      company: caseData.company,
      recruiterMessage: caseData.recruiterMessage,
      jobUrl: caseData.jobUrl,
    },
    p2Analysis.case_summary,
    p2Analysis.requests
  );

  // 2. Index evidence
  const evidenceIndex = indexCaseEvidence(
    caseData.evidence,
    caseData.recruiterMessage,
    caseData.jobUrl
  );

  // 3. Evaluate deterministic rules
  const deterministicFindings = evaluateRules({
    facts: normalizedFacts,
    index: evidenceIndex,
    p2RiskIndicators: p2Analysis.risk_indicators,
    rawMessage: caseData.recruiterMessage,
    jobUrl: caseData.jobUrl,
  });

  // 4. Detect contradictions across supplied evidence items
  const contradictions = detectContradictions({
    analysis: p2Analysis,
    evidenceIndex,
    recruiterMessage: caseData.recruiterMessage,
    jobUrl: caseData.jobUrl,
    caseTitle: caseData.title,
    caseCompany: caseData.company,
  });

  // 5. Deduplicate findings (rules + P2 indicators)
  const findings = deduplicateFindings(
    deterministicFindings,
    p2Analysis.risk_indicators,
    evidenceIndex
  );

  // 6. Generate verification queue targets
  const verificationTargets = generateVerificationTargets({
    facts: normalizedFacts,
    findings,
    contradictions,
    p2Targets: p2Analysis.verification_targets,
  });

  // 7. Calculate summary metrics
  const highSeverityCount = findings.filter((f) => f.severity === "high").length;
  const mediumSeverityCount = findings.filter((f) => f.severity === "medium").length;
  const lowSeverityCount = findings.filter((f) => f.severity === "low").length;

  return {
    generatedAt,
    intelligenceVersion: 1,
    normalizedFacts,
    findings,
    contradictions,
    verificationTargets,
    summary: {
      totalFindings: findings.length,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      contradictionCount: contradictions.length,
      verificationTargetCount: verificationTargets.length,
    },
  };
}
