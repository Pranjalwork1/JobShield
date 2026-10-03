import { Contradiction, EvidenceReference } from "./types";
import { CaseEvidenceIndex } from "./evidence";
import { normalizeCompany, normalizeSalary } from "./normalize";
import { JobShieldAnalysis } from "@/lib/schemas";

export interface ContradictionContext {
  analysis?: JobShieldAnalysis | null;
  evidenceIndex: CaseEvidenceIndex;
  recruiterMessage?: string | null;
  jobUrl?: string | null;
  caseTitle?: string | null;
  caseCompany?: string | null;
}

/**
 * Detects factual contradictions across multiple supplied evidence items.
 * Adheres strictly to the conservative comparison rules:
 * - Missing data is NEVER a contradiction.
 * - Minor variations (e.g. 'ABC Technologies Pvt Ltd' vs 'ABC Technologies') are not contradictions.
 */
export function detectContradictions(ctx: ContradictionContext): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const { analysis, evidenceIndex } = ctx;

  const items = evidenceIndex.items;
  if (items.length < 2) {
    // If there is only one piece of evidence or fewer, cross-evidence contradiction is not possible
    // unless Gemini extracted multiple conflicting claims with distinct references
    return detectIntraAnalysisContradictions(analysis, evidenceIndex);
  }

  // 1. SALARY CONTRADICTION
  const salaryContradiction = detectSalaryContradiction(ctx);
  if (salaryContradiction) {
    contradictions.push(salaryContradiction);
  }

  // 2. COMPANY CONTRADICTION
  const companyContradiction = detectCompanyContradiction(ctx);
  if (companyContradiction) {
    contradictions.push(companyContradiction);
  }

  // 3. RECRUITER IDENTITY CONTRADICTION
  const recruiterContradiction = detectRecruiterContradiction(ctx);
  if (recruiterContradiction) {
    contradictions.push(recruiterContradiction);
  }

  // 4. JOB TITLE CONTRADICTION
  const titleContradiction = detectJobTitleContradiction(ctx);
  if (titleContradiction) {
    contradictions.push(titleContradiction);
  }

  // 5. LOCATION CONTRADICTION
  const locationContradiction = detectLocationContradiction(ctx);
  if (locationContradiction) {
    contradictions.push(locationContradiction);
  }

  // 6. Merge any explicit contradiction identified by Gemini claims
  const intraContradictions = detectIntraAnalysisContradictions(analysis, evidenceIndex);
  for (const ic of intraContradictions) {
    if (!contradictions.some((c) => c.field === ic.field)) {
      contradictions.push(ic);
    }
  }

  return contradictions;
}

/**
 * Salary Contradiction Detector:
 * Checks for different salary amounts across message vs offer letter or claims.
 */
function detectSalaryContradiction(ctx: ContradictionContext): Contradiction | null {
  const { analysis, evidenceIndex, recruiterMessage } = ctx;
  const observedSalaries: Array<{ raw: string; normalizedAmount: number | null; evidence: EvidenceReference }> = [];

  // Check recruiter message
  if (recruiterMessage) {
    const msgSalaryMatch = recruiterMessage.match(
      /(?:₹|\$|inr|rs\.?)\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:lpa|lakhs?|per annum|\/year|p\.a\.?)?/i
    );
    if (msgSalaryMatch) {
      const norm = normalizeSalary(msgSalaryMatch[0]);
      if (norm.amount) {
        const msgRef = evidenceIndex.items.find((i) => i.evidenceType === "text") || {
          evidenceId: "msg",
          evidenceName: "Recruiter Message",
          evidenceType: "text",
          description: "Recruiter message",
        };
        observedSalaries.push({
          raw: msgSalaryMatch[0].trim(),
          normalizedAmount: norm.amount,
          evidence: msgRef,
        });
      }
    }
  }

  // Check analysis case summary
  if (analysis?.case_summary?.salary) {
    const norm = normalizeSalary(analysis.case_summary.salary);
    if (norm.amount) {
      // Find the file reference (PDF or Image)
      const fileRef = evidenceIndex.items.find(
        (i) => i.evidenceType === "pdf" || i.evidenceType === "image"
      );
      if (fileRef) {
        observedSalaries.push({
          raw: analysis.case_summary.salary.trim(),
          normalizedAmount: norm.amount,
          evidence: fileRef,
        });
      }
    }
  }

  // Check claims from Gemini for conflicting salary figures
  if (analysis?.claims) {
    for (const c of analysis.claims) {
      if (/salary|compensation|package|ctc|lpa/i.test(c.claim)) {
        const norm = normalizeSalary(c.claim);
        if (norm.amount) {
          const matchedEv = evidenceIndex.items.find((i) =>
            c.evidence_reference?.toLowerCase().includes(i.evidenceName.toLowerCase())
          ) || evidenceIndex.primaryItem || evidenceIndex.items[0];

          if (
            matchedEv &&
            !observedSalaries.some(
              (o) => o.evidence.evidenceId === matchedEv.evidenceId && o.normalizedAmount === norm.amount
            )
          ) {
            observedSalaries.push({
              raw: c.claim,
              normalizedAmount: norm.amount,
              evidence: matchedEv,
            });
          }
        }
      }
    }
  }

  // Compare observed salaries if at least 2 distinct evidence items provide numeric figures
  if (observedSalaries.length >= 2) {
    for (let i = 0; i < observedSalaries.length; i++) {
      for (let j = i + 1; j < observedSalaries.length; j++) {
        const a = observedSalaries[i];
        const b = observedSalaries[j];

        // Ensure from different evidence items
        if (a.evidence.evidenceId === b.evidence.evidenceId) continue;
        if (!a.normalizedAmount || !b.normalizedAmount) continue;

        // If difference is greater than 10%
        const diff = Math.abs(a.normalizedAmount - b.normalizedAmount);
        const avg = (a.normalizedAmount + b.normalizedAmount) / 2;
        if (diff / avg > 0.1) {
          return {
            id: "contradiction_salary",
            field: "salary",
            title: "Salary information differs across supplied evidence",
            explanation: `One evidence item states ${a.raw}, while another states ${b.raw}. This discrepancy should be clarified with the official employer.`,
            values: [
              { value: a.raw, evidence: a.evidence },
              { value: b.raw, evidence: b.evidence },
            ],
            severity: "medium",
          };
        }
      }
    }
  }

  return null;
}

/**
 * Company Contradiction Detector:
 * Checks if different evidence items cite materially different employers.
 */
function detectCompanyContradiction(ctx: ContradictionContext): Contradiction | null {
  const { analysis, evidenceIndex } = ctx;
  const companies: Array<{ raw: string; normalized: string; evidence: EvidenceReference }> = [];

  // From analysis summary
  if (analysis?.case_summary?.company) {
    const norm = normalizeCompany(analysis.case_summary.company);
    if (norm.normalizedName) {
      const primary = evidenceIndex.primaryItem || evidenceIndex.items[0];
      companies.push({
        raw: analysis.case_summary.company,
        normalized: norm.normalizedName,
        evidence: primary,
      });
    }
  }

  // Check claims for company mentions
  if (analysis?.claims) {
    for (const c of analysis.claims) {
      if (/company|organization|employer|enterprise/i.test(c.claim)) {
        const matched = evidenceIndex.items.find((i) =>
          c.evidence_reference?.toLowerCase().includes(i.evidenceName.toLowerCase())
        );
        if (matched) {
          const norm = normalizeCompany(c.claim);
          if (
            norm.normalizedName &&
            !companies.some((x) => x.evidence.evidenceId === matched.evidenceId)
          ) {
            companies.push({
              raw: c.claim,
              normalized: norm.normalizedName,
              evidence: matched,
            });
          }
        }
      }
    }
  }

  // Compare
  if (companies.length >= 2) {
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        const a = companies[i];
        const b = companies[j];
        if (a.evidence.evidenceId === b.evidence.evidenceId) continue;

        if (
          a.normalized !== b.normalized &&
          !a.normalized.includes(b.normalized) &&
          !b.normalized.includes(a.normalized)
        ) {
          return {
            id: "contradiction_company",
            field: "company",
            title: "Company identity differs across supplied evidence",
            explanation: `Different evidence items reference different company names: "${a.raw}" versus "${b.raw}".`,
            values: [
              { value: a.raw, evidence: a.evidence },
              { value: b.raw, evidence: b.evidence },
            ],
            severity: "high",
          };
        }
      }
    }
  }

  return null;
}

/**
 * Recruiter Contradiction Detector:
 * Checks if recruiter identity differs materially across evidence.
 */
function detectRecruiterContradiction(ctx: ContradictionContext): Contradiction | null {
  const { analysis, evidenceIndex } = ctx;
  const recruiters: Array<{ raw: string; evidence: EvidenceReference }> = [];

  if (analysis?.case_summary?.recruiter_name) {
    const primary = evidenceIndex.primaryItem || evidenceIndex.items[0];
    recruiters.push({
      raw: analysis.case_summary.recruiter_name.trim(),
      evidence: primary,
    });
  }

  if (analysis?.claims) {
    for (const c of analysis.claims) {
      if (/recruiter|contact person|hr lead|talent acquisition/i.test(c.claim)) {
        const matched = evidenceIndex.items.find((i) =>
          c.evidence_reference?.toLowerCase().includes(i.evidenceName.toLowerCase())
        );
        if (matched && !recruiters.some((r) => r.evidence.evidenceId === matched.evidenceId)) {
          recruiters.push({
            raw: c.claim.trim(),
            evidence: matched,
          });
        }
      }
    }
  }

  if (recruiters.length >= 2) {
    const a = recruiters[0];
    const b = recruiters[1];
    if (
      a.evidence.evidenceId !== b.evidence.evidenceId &&
      a.raw.toLowerCase() !== b.raw.toLowerCase()
    ) {
      return {
        id: "contradiction_recruiter",
        field: "recruiter",
        title: "Recruiter identity differs across supplied evidence",
        explanation: `Evidence items mention different recruiter names: "${a.raw}" and "${b.raw}".`,
        values: [
          { value: a.raw, evidence: a.evidence },
          { value: b.raw, evidence: b.evidence },
        ],
        severity: "medium",
      };
    }
  }

  return null;
}

/**
 * Job Title Contradiction Detector:
 * Checks if materially different job positions are stated.
 */
function detectJobTitleContradiction(ctx: ContradictionContext): Contradiction | null {
  const { analysis, evidenceIndex } = ctx;
  const roles: Array<{ raw: string; normalized: string; evidence: EvidenceReference }> = [];

  if (analysis?.case_summary?.job_title) {
    const primary = evidenceIndex.primaryItem || evidenceIndex.items[0];
    roles.push({
      raw: analysis.case_summary.job_title,
      normalized: analysis.case_summary.job_title.toLowerCase().trim(),
      evidence: primary,
    });
  }

  if (analysis?.claims) {
    for (const c of analysis.claims) {
      if (/position|role|job title|designation/i.test(c.claim)) {
        const matched = evidenceIndex.items.find((i) =>
          c.evidence_reference?.toLowerCase().includes(i.evidenceName.toLowerCase())
        );
        if (matched && !roles.some((r) => r.evidence.evidenceId === matched.evidenceId)) {
          roles.push({
            raw: c.claim,
            normalized: c.claim.toLowerCase().trim(),
            evidence: matched,
          });
        }
      }
    }
  }

  if (roles.length >= 2) {
    const a = roles[0];
    const b = roles[1];
    // Don't flag "Software Engineer" vs "Senior Software Engineer" or "Software Developer"
    const isMajorDifference =
      !a.normalized.includes(b.normalized) &&
      !b.normalized.includes(a.normalized) &&
      Math.abs(a.normalized.length - b.normalized.length) > 3;

    if (a.evidence.evidenceId !== b.evidence.evidenceId && isMajorDifference) {
      return {
        id: "contradiction_title",
        field: "job_title",
        title: "Job title differs across supplied evidence",
        explanation: `Different roles are stated across evidence: "${a.raw}" versus "${b.raw}".`,
        values: [
          { value: a.raw, evidence: a.evidence },
          { value: b.raw, evidence: b.evidence },
        ],
        severity: "medium",
      };
    }
  }

  return null;
}

/**
 * Location Contradiction Detector:
 * Checks if different locations are stated.
 */
function detectLocationContradiction(ctx: ContradictionContext): Contradiction | null {
  const { analysis, evidenceIndex } = ctx;
  if (!analysis?.case_summary?.location) return null;

  // Check if claims or message mention conflicting locations
  const locA = analysis.case_summary.location.trim();
  if (analysis.claims) {
    for (const c of analysis.claims) {
      if (/location|city|office in|based in|noida|bengaluru|delhi|mumbai/i.test(c.claim)) {
        const matched = evidenceIndex.items.find((i) =>
          c.evidence_reference?.toLowerCase().includes(i.evidenceName.toLowerCase())
        );
        if (
          matched &&
          !c.claim.toLowerCase().includes(locA.toLowerCase()) &&
          !locA.toLowerCase().includes(c.claim.toLowerCase())
        ) {
          return {
            id: "contradiction_location",
            field: "location",
            title: "Job location differs across supplied evidence",
            explanation: `Different work locations are mentioned in the evidence: "${locA}" versus "${c.claim}".`,
            values: [
              { value: locA, evidence: evidenceIndex.primaryItem || evidenceIndex.items[0] },
              { value: c.claim, evidence: matched },
            ],
            severity: "low",
          };
        }
      }
    }
  }

  return null;
}

/**
 * Fallback to check if Gemini's risk indicators explicitly found a contradiction between documents.
 */
function detectIntraAnalysisContradictions(
  analysis: JobShieldAnalysis | null | undefined,
  evidenceIndex: CaseEvidenceIndex
): Contradiction[] {
  const res: Contradiction[] = [];
  if (!analysis?.risk_indicators) return res;

  for (const r of analysis.risk_indicators) {
    const text = `${r.indicator} ${r.explanation}`.toLowerCase();
    if (
      /contradict|inconsisten|mismatch|conflict|differ across/i.test(text)
    ) {
      let field: Contradiction["field"] = "other";
      if (/salary|compensation/i.test(text)) field = "salary";
      else if (/company|employer/i.test(text)) field = "company";
      else if (/recruiter|contact/i.test(text)) field = "recruiter";
      else if (/role|title/i.test(text)) field = "job_title";
      else if (/location/i.test(text)) field = "location";

      const evRefs = evidenceIndex.items.slice(0, 2);
      if (evRefs.length > 0) {
        res.push({
          id: `contradiction_p2_${res.length + 1}`,
          field,
          title: r.indicator,
          explanation: r.explanation,
          values: evRefs.map((ev) => ({
            value: r.observed_evidence || "Observed in document",
            evidence: ev,
          })),
          severity: r.severity || "medium",
        });
      }
    }
  }

  return res;
}
