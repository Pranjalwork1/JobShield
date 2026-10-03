import {
  IntelligenceFinding,
  NormalizedFacts,
  FindingType,
  IntelligenceSeverity,
} from "./types";
import { CaseEvidenceIndex, resolveEvidenceReferences } from "./evidence";
import { RiskIndicator } from "@/lib/schemas";

export interface RuleEvaluationContext {
  facts: NormalizedFacts;
  index: CaseEvidenceIndex;
  p2RiskIndicators?: RiskIndicator[];
  rawMessage?: string | null;
  jobUrl?: string | null;
}

/**
 * Deterministic Rule 1: Candidate payment requested
 */
function evaluatePaymentRequestRule(
  ctx: RuleEvaluationContext
): IntelligenceFinding | null {
  const { facts, index } = ctx;
  if (!facts.requests.paymentRequested) {
    return null;
  }

  const amountStr = facts.requests.paymentAmount
    ? ` ${facts.requests.paymentAmount}`
    : "";

  let observed = `Recruiter message or evidence requests${amountStr} payment before employment.`;
  if (facts.requests.paymentAmount) {
    observed = `Evidence requests ${facts.requests.paymentAmount} as a candidate payment / fee.`;
  }

  const evidenceRefs = resolveEvidenceReferences("message", index);

  return {
    id: "finding_payment_request",
    type: "payment_request",
    severity: "high",
    title: "Candidate payment requested",
    summary:
      "A payment is requested before the stated employment process is complete.",
    observedEvidence: observed,
    whyItMatters:
      "Candidate payment requests should be independently verified before money is sent. Genuine employers rarely demand upfront registration, processing, training, or verification fees.",
    evidence: evidenceRefs,
    ruleId: "PAYMENT_REQUEST",
    confidence: "high",
  };
}

/**
 * Deterministic Rule 2: Financial credentials requested
 */
function evaluateFinancialCredentialsRule(
  ctx: RuleEvaluationContext
): IntelligenceFinding | null {
  const { facts, index, rawMessage } = ctx;
  const bankRequested = facts.requests.bankDetailsRequested;
  const msgHasFinancial = rawMessage
    ? /bank account|account number|ifsc|cheque|cancelled cheque|upi pin|otp|credit card|cvv|password/i.test(
        rawMessage
      )
    : false;

  if (!bankRequested && !msgHasFinancial) {
    return null;
  }

  const evidenceRefs = resolveEvidenceReferences("message", index);

  return {
    id: "finding_financial_credentials",
    type: "sensitive_data_request",
    severity: "high",
    title: "Financial credentials requested",
    summary:
      "Bank account details, cancelled cheque, or payment credentials were requested in the intake evidence.",
    observedEvidence:
      "Evidence requests bank account information, cancelled cheque, or financial credentials.",
    whyItMatters:
      "Financial and banking credentials should be independently verified before sharing. Never share OTPs, UPI PINs, or banking credentials with unverified contacts.",
    evidence: evidenceRefs,
    ruleId: "FINANCIAL_CREDENTIALS",
    confidence: "high",
  };
}

/**
 * Deterministic Rule 3: Sensitive identity documents requested (PAN, Aadhaar, Passport)
 */
function evaluateSensitiveIdentityDataRule(
  ctx: RuleEvaluationContext
): IntelligenceFinding | null {
  const { facts, index, rawMessage } = ctx;
  const items = facts.requests.sensitiveInformationRequested || [];
  const textToCheck = `${items.join(" ")} ${rawMessage || ""}`;

  const hasPan = /pan\b/i.test(textToCheck);
  const hasAadhaar = /aadhaar|aadhar/i.test(textToCheck);
  const hasPassport = /passport/i.test(textToCheck);
  const hasSsn = /ssn|social security/i.test(textToCheck);

  if (!hasPan && !hasAadhaar && !hasPassport && !hasSsn && items.length === 0) {
    return null;
  }

  const docNames: string[] = [];
  if (hasPan) docNames.push("PAN");
  if (hasAadhaar) docNames.push("Aadhaar");
  if (hasPassport) docNames.push("Passport");
  if (hasSsn) docNames.push("SSN");
  if (docNames.length === 0 && items.length > 0) {
    docNames.push(...items.slice(0, 3));
  }

  const observed = `Evidence requests candidate to provide copies of ${docNames.join(" and ")}.`;
  const evidenceRefs = resolveEvidenceReferences("message", index);

  return {
    id: "finding_sensitive_identity_data",
    type: "sensitive_data_request",
    severity: "medium",
    title: "Sensitive identity documents requested",
    summary:
      "Government-issued identity documents are requested during the recruitment intake.",
    observedEvidence: observed,
    whyItMatters:
      "Sensitive government identity documents should be independently verified before sharing. Confirm the employer and official onboarding channel before sending copies of your ID.",
    evidence: evidenceRefs,
    ruleId: "SENSITIVE_DATA_REQUEST",
    confidence: "high",
  };
}

/**
 * Deterministic Rule 4: Recruiter uses a public email domain
 */
function evaluatePublicEmailDomainRule(
  ctx: RuleEvaluationContext
): IntelligenceFinding | null {
  const { facts, index } = ctx;
  const email = facts.recruiter.email;
  const domain = facts.recruiter.emailDomain;
  const companyName = facts.company.name;

  if (!email || !domain || !companyName) {
    return null;
  }

  const publicDomains = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "ymail.com",
    "rocketmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "aol.com",
    "rediffmail.com",
  ];

  if (!publicDomains.includes(domain.toLowerCase())) {
    return null;
  }

  const evidenceRefs = resolveEvidenceReferences("message", index);

  return {
    id: "finding_public_email_domain",
    type: "contact_mismatch",
    severity: "medium",
    title: "Recruiter uses a public email domain",
    summary:
      "The recruiter contact uses a free public email provider rather than a corporate domain.",
    observedEvidence: `Recruiter email (${email}) uses public domain @${domain}.`,
    whyItMatters:
      "The supplied recruiter contact uses a public email domain. Independently confirm that the contact is associated with the employer before sharing sensitive information.",
    evidence: evidenceRefs,
    ruleId: "PUBLIC_RECRUITER_EMAIL",
    confidence: "high",
  };
}

/**
 * Deterministic Rule 5: Recruiter email domain differs from supplied company domain
 */
function evaluateDomainMismatchRule(
  ctx: RuleEvaluationContext
): IntelligenceFinding | null {
  const { facts, index } = ctx;
  const companyDomain = facts.company.domain;
  const recruiterDomain = facts.recruiter.emailDomain;

  if (!companyDomain || !recruiterDomain) {
    return null;
  }

  // If recruiter domain is identical to company domain, or is a subdomain of company domain
  const cleanComp = companyDomain.toLowerCase().replace(/^www\./, "");
  const cleanRecruiter = recruiterDomain.toLowerCase().replace(/^www\./, "");

  if (
    cleanRecruiter === cleanComp ||
    cleanRecruiter.endsWith(`.${cleanComp}`) ||
    cleanComp.endsWith(`.${cleanRecruiter}`)
  ) {
    return null;
  }

  const evidenceRefs = resolveEvidenceReferences("url", index);

  return {
    id: "finding_domain_mismatch",
    type: "contact_mismatch",
    severity: "medium",
    title: "Recruiter email domain differs from supplied company domain",
    summary:
      "The recruiter's email domain does not match the company's supplied website domain.",
    observedEvidence: `Recruiter email domain (@${cleanRecruiter}) differs from supplied company domain (${cleanComp}).`,
    whyItMatters:
      "A discrepancy between the recruiter's email domain and the company's official domain warrants independent verification of the contact.",
    evidence: evidenceRefs,
    ruleId: "DOMAIN_MISMATCH",
    confidence: "medium",
  };
}

/**
 * Evaluates all deterministic rules and enriches with non-duplicate Gemini P2 indicators.
 */
export function evaluateRules(
  ctx: RuleEvaluationContext
): IntelligenceFinding[] {
  const findings: IntelligenceFinding[] = [];

  // Run deterministic rules
  const paymentFinding = evaluatePaymentRequestRule(ctx);
  if (paymentFinding) findings.push(paymentFinding);

  const financialFinding = evaluateFinancialCredentialsRule(ctx);
  if (financialFinding) findings.push(financialFinding);

  const sensitiveIdentityFinding = evaluateSensitiveIdentityDataRule(ctx);
  if (sensitiveIdentityFinding) findings.push(sensitiveIdentityFinding);

  const publicEmailFinding = evaluatePublicEmailDomainRule(ctx);
  if (publicEmailFinding) findings.push(publicEmailFinding);

  const domainMismatchFinding = evaluateDomainMismatchRule(ctx);
  if (domainMismatchFinding) findings.push(domainMismatchFinding);

  return findings;
}

/**
 * Deduplicates deterministic findings with Gemini P2 risk indicators.
 * Deterministic rules provide the primary finding; Gemini evidence enriches observations.
 */
export function deduplicateFindings(
  ruleFindings: IntelligenceFinding[],
  p2RiskIndicators: RiskIndicator[] | undefined,
  index: CaseEvidenceIndex
): IntelligenceFinding[] {
  const result: IntelligenceFinding[] = [...ruleFindings];

  if (!p2RiskIndicators || p2RiskIndicators.length === 0) {
    return result;
  }

  for (const indicator of p2RiskIndicators) {
    const indText = `${indicator.indicator} ${indicator.explanation}`.toLowerCase();

    // Check if covered by deterministic rules
    const isPayment =
      /payment|fee|registration fee|deposit|charge|money/i.test(indText);
    const isFinancial =
      /bank|account details|ifsc|cheque|upi|otp|financial credential/i.test(indText);
    const isSensitive =
      /pan|aadhaar|aadhar|passport|identity document|sensitive information/i.test(indText);
    const isEmailDomain =
      /email domain|gmail|public email|free email/i.test(indText);
    const isDomainMismatch =
      /domain mismatch|different domain|web domain/i.test(indText);

    const matchesPaymentRule =
      isPayment && result.some((f) => f.ruleId === "PAYMENT_REQUEST");
    const matchesFinancialRule =
      isFinancial && result.some((f) => f.ruleId === "FINANCIAL_CREDENTIALS");
    const matchesSensitiveRule =
      isSensitive && result.some((f) => f.ruleId === "SENSITIVE_DATA_REQUEST");
    const matchesEmailRule =
      isEmailDomain && result.some((f) => f.ruleId === "PUBLIC_EMAIL_DOMAINS" || f.ruleId === "PUBLIC_RECRUITER_EMAIL");
    const matchesMismatchRule =
      isDomainMismatch && result.some((f) => f.ruleId === "DOMAIN_MISMATCH");

    if (
      matchesPaymentRule ||
      matchesFinancialRule ||
      matchesSensitiveRule ||
      matchesEmailRule ||
      matchesMismatchRule
    ) {
      // Already covered by deterministic finding -> enrich observation if useful
      const matchingFinding = result.find((f) => {
        if (matchesPaymentRule) return f.ruleId === "PAYMENT_REQUEST";
        if (matchesFinancialRule) return f.ruleId === "FINANCIAL_CREDENTIALS";
        if (matchesSensitiveRule) return f.ruleId === "SENSITIVE_DATA_REQUEST";
        if (matchesEmailRule) return f.ruleId === "PUBLIC_RECRUITER_EMAIL";
        if (matchesMismatchRule) return f.ruleId === "DOMAIN_MISMATCH";
        return false;
      });

      if (
        matchingFinding &&
        indicator.observed_evidence &&
        !matchingFinding.observedEvidence.includes(indicator.observed_evidence)
      ) {
        matchingFinding.observedEvidence = `${matchingFinding.observedEvidence} (Observed: "${indicator.observed_evidence}")`;
      }
      continue;
    }

    // Map additional genuine P2 indicators to findings
    let mappedType: FindingType = "unusual_request";
    if (/salary|compensation|package/i.test(indText)) {
      mappedType = "salary_inconsistency";
    } else if (/identity|company|impersonation/i.test(indText)) {
      mappedType = "identity_inconsistency";
    } else if (/timeline|urgent|urgency|deadline/i.test(indText)) {
      mappedType = "timeline_inconsistency";
    } else if (/recruiter|contact/i.test(indText)) {
      mappedType = "recruiter_inconsistency";
    }

    const severity: IntelligenceSeverity = indicator.severity || "medium";
    const evidenceRefs = resolveEvidenceReferences(
      indicator.evidence_reference,
      index
    );

    result.push({
      id: `finding_p2_${result.length + 1}`,
      type: mappedType,
      severity,
      title: indicator.indicator,
      summary: indicator.explanation || indicator.indicator,
      observedEvidence:
        indicator.observed_evidence ||
        `Observed in ${indicator.evidence_reference || "submitted evidence"}.`,
      whyItMatters:
        "This recruitment indicator was observed in the supplied evidence and should be independently clarified.",
      evidence: evidenceRefs,
      ruleId: "OBSERVED_EVIDENCE_PATTERN",
      confidence: "medium",
    });
  }

  return result;
}
