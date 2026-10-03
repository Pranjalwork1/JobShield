import {
  IntelligenceVerificationTarget,
  IntelligenceFinding,
  Contradiction,
  NormalizedFacts,
} from "./types";
import { VerificationTarget } from "@/lib/schemas";

export interface VerificationContext {
  facts: NormalizedFacts;
  findings: IntelligenceFinding[];
  contradictions: Contradiction[];
  p2Targets?: VerificationTarget[];
}

/**
 * Generates structured, actionable verification targets from findings, contradictions, and facts.
 * Every target starts as "not_started".
 */
export function generateVerificationTargets(
  ctx: VerificationContext
): IntelligenceVerificationTarget[] {
  const { facts, findings, contradictions, p2Targets } = ctx;
  const targets: IntelligenceVerificationTarget[] = [];
  const addedTitles = new Set<string>();

  // 1. PAYMENT TARGET (High Priority)
  const paymentFinding = findings.find((f) => f.ruleId === "PAYMENT_REQUEST");
  if (paymentFinding || facts.requests.paymentRequested) {
    const title = "Confirm payment requirement with official HR";
    targets.push({
      id: "target_verify_payment",
      title,
      reason:
        "A candidate payment is requested. Independently verify via the employer's official published recruitment channel whether any registration or equipment deposit is authorized.",
      priority: "high",
      sourceFindingIds: paymentFinding ? [paymentFinding.id] : [],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 2. SENSITIVE CREDENTIALS / FINANCIAL TARGET (High Priority)
  const financialFinding = findings.find((f) => f.ruleId === "FINANCIAL_CREDENTIALS");
  if (financialFinding || facts.requests.bankDetailsRequested) {
    const title = "Confirm banking & financial details requirement";
    targets.push({
      id: "target_verify_financial",
      title,
      reason:
        "Financial credentials or bank account details are requested. Verify the legitimacy of the onboarding process before transmitting account details.",
      priority: "high",
      sourceFindingIds: financialFinding ? [financialFinding.id] : [],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 3. SENSITIVE IDENTITY DOCUMENTS (Medium/High Priority)
  const identityFinding = findings.find((f) => f.ruleId === "SENSITIVE_DATA_REQUEST");
  if (
    identityFinding ||
    (facts.requests.sensitiveInformationRequested &&
      facts.requests.sensitiveInformationRequested.length > 0)
  ) {
    const title = "Confirm requested identity documents";
    targets.push({
      id: "target_verify_identity_docs",
      title,
      reason:
        "Government-issued identity documents (e.g. PAN, Aadhaar, Passport) are requested. Confirm that the recruiter and offer are authentic before uploading official ID scans.",
      priority: "medium",
      sourceFindingIds: identityFinding ? [identityFinding.id] : [],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 4. PUBLIC RECRUITER EMAIL / CONTACT (Medium Priority)
  const emailFinding = findings.find(
    (f) => f.ruleId === "PUBLIC_RECRUITER_EMAIL" || f.ruleId === "DOMAIN_MISMATCH"
  );
  if (emailFinding || (facts.recruiter.email && facts.recruiter.emailDomain?.includes("gmail"))) {
    const title = "Verify recruiter identity and corporate email";
    targets.push({
      id: "target_verify_recruiter_email",
      title,
      reason:
        "The recruiter contact is using a public or non-standard email domain. Reach out to the organization's published HR switchboard to confirm their association.",
      priority: "medium",
      sourceFindingIds: emailFinding ? [emailFinding.id] : [],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 5. SALARY CONTRADICTION / COMPENSATION RECONCILIATION
  const salaryContradiction = contradictions.find((c) => c.field === "salary");
  if (salaryContradiction) {
    const title = "Clarify compensation terms across recruitment documents";
    targets.push({
      id: "target_verify_salary_terms",
      title,
      reason:
        salaryContradiction.explanation ||
        "Different compensation figures were observed across evidence items. Request written reconciliation from human resources.",
      priority: "medium",
      sourceFindingIds: [salaryContradiction.id],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 6. COMPANY CONTRADICTION / IDENTITY
  const companyContradiction = contradictions.find((c) => c.field === "company");
  if (companyContradiction) {
    const title = "Confirm hiring employer entity";
    targets.push({
      id: "target_verify_company_entity",
      title,
      reason:
        "Multiple company names appear across the supplied evidence. Clarify which legal corporate entity is the actual employer.",
      priority: "high",
      sourceFindingIds: [companyContradiction.id],
      status: "not_started",
      completedAt: null,
    });
    addedTitles.add(title.toLowerCase());
  }

  // 7. COMPANY IDENTITY & JOB EXISTENCE (Baseline targets when company or job are extracted)
  if (facts.company.name) {
    const title = `Confirm employer identity for ${facts.company.name}`;
    if (!addedTitles.has(title.toLowerCase())) {
      targets.push({
        id: "target_verify_company_official",
        title,
        reason:
          "Verify that the employer is an authentic registered business via official corporate registries or verified company channels.",
        priority: "medium",
        sourceFindingIds: [],
        status: "not_started",
        completedAt: null,
      });
      addedTitles.add(title.toLowerCase());
    }
  }

  if (facts.job.title) {
    const title = `Confirm job exists on official careers portal`;
    if (!addedTitles.has(title.toLowerCase())) {
      targets.push({
        id: "target_verify_job_opening",
        title,
        reason:
          "Search for the job opening directly on the company's verified website or LinkedIn careers page to verify this requisition is open.",
        priority: "medium",
        sourceFindingIds: [],
        status: "not_started",
        completedAt: null,
      });
      addedTitles.add(title.toLowerCase());
    }
  }

  // 8. Enrich with any remaining unique P2 verification targets
  if (p2Targets && p2Targets.length > 0) {
    for (const pt of p2Targets) {
      const lower = pt.target.toLowerCase();
      if (
        !addedTitles.has(lower) &&
        !Array.from(addedTitles).some(
          (t) => t.includes(lower) || lower.includes(t)
        )
      ) {
        targets.push({
          id: `target_p2_${targets.length + 1}`,
          title: pt.target,
          reason: pt.reason,
          priority: pt.priority || "medium",
          sourceFindingIds: [],
          status: "not_started",
          completedAt: null,
        });
        addedTitles.add(lower);
      }
    }
  }

  return targets;
}
