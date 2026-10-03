export type IntelligenceSeverity = "high" | "medium" | "low";

export type FindingType =
  | "payment_request"
  | "sensitive_data_request"
  | "contact_mismatch"
  | "identity_inconsistency"
  | "salary_inconsistency"
  | "role_inconsistency"
  | "location_inconsistency"
  | "timeline_inconsistency"
  | "recruiter_inconsistency"
  | "document_inconsistency"
  | "unusual_request"
  | "other";

export interface NormalizedCompany {
  name: string | null;
  normalizedName: string | null;
  domain: string | null;
}

export interface NormalizedRecruiter {
  name: string | null;
  email: string | null;
  emailDomain: string | null;
  phone: string | null;
}

export interface NormalizedSalary {
  raw: string | null;
  amount: number | null;
  currency: string | null;
  period: "annual" | "monthly" | "unknown";
}

export interface NormalizedJob {
  title: string | null;
  normalizedTitle: string | null;
  location: string | null;
  salary: string | null;
  normalizedSalary?: NormalizedSalary | null;
}

export interface NormalizedRequests {
  paymentRequested: boolean;
  paymentAmount: string | null;
  sensitiveInformationRequested: string[];
  bankDetailsRequested: boolean;
  otherRequests: string[];
}

export interface NormalizedFacts {
  company: NormalizedCompany;
  recruiter: NormalizedRecruiter;
  job: NormalizedJob;
  requests: NormalizedRequests;
}

export interface EvidenceReference {
  evidenceId: string;
  evidenceName: string;
  evidenceType: "pdf" | "image" | "text" | "url";
  description: string;
  location?: string | null;
}

export interface IntelligenceFinding {
  id: string;
  type: FindingType;
  severity: IntelligenceSeverity;
  title: string;
  summary: string;
  observedEvidence: string;
  whyItMatters: string;
  evidence: EvidenceReference[];
  ruleId: string;
  confidence: "high" | "medium" | "low";
}

export interface Contradiction {
  id: string;
  field:
    | "company"
    | "job_title"
    | "salary"
    | "location"
    | "recruiter"
    | "email"
    | "phone"
    | "date"
    | "payment"
    | "other";
  title: string;
  explanation: string;
  values: {
    value: string;
    evidence: EvidenceReference;
  }[];
  severity: "high" | "medium" | "low";
}

export interface IntelligenceVerificationTarget {
  id: string;
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
  sourceFindingIds: string[];
  status: "not_started" | "in_progress" | "completed";
  completedAt: string | null;
}

export interface CaseTimelineEvent {
  id: string;
  type:
    | "case_created"
    | "evidence_added"
    | "evidence_removed"
    | "analysis_completed"
    | "intelligence_generated"
    | "verification_started"
    | "verification_completed";
  timestamp: string;
  description: string;
}

export interface JobShieldIntelligence {
  generatedAt: string;
  intelligenceVersion?: number;
  normalizedFacts: NormalizedFacts;
  findings: IntelligenceFinding[];
  contradictions: Contradiction[];
  verificationTargets: IntelligenceVerificationTarget[];
  summary: {
    totalFindings: number;
    highSeverityCount: number;
    mediumSeverityCount: number;
    lowSeverityCount: number;
    contradictionCount: number;
    verificationTargetCount: number;
  };
}
